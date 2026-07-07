import json
import logging
import openai
from django.conf import settings

logger = logging.getLogger(__name__)


def is_mock_mode():
    api_key = getattr(settings, 'OPENAI_API_KEY', '').strip()
    return not api_key or api_key.lower() in ('', 'your-key-here') or 'mock' in api_key.lower()


VISION_SYSTEM_PROMPT = """You are a precision computer vision and OCR specialist.

Your ONLY job is to read the actual text and visual data from the supplied image.

STRICT RULES:
- Return ONLY what is explicitly visible and readable in the image.
- Do NOT invent, assume, guess, or fill in missing data.
- Do NOT use your training knowledge to fill in product details.
- Do NOT use example names, sample chemicals, or placeholder values.
- If a field is not visible in the image, return null for that field.
- confidence_score must reflect how clearly you can read the label (0-100).

Return ONLY a JSON object. No other text."""

VISION_USER_PROMPT = """Analyse this product image carefully.

Read every line of text visible on the packaging, label, or container.

Return a JSON object with exactly these fields:

{
  "product_name": "the exact product name as written on the label, or null",
  "brand": "the exact brand or company name visible, or null",
  "manufacturer": "manufacturer name if different from brand, or null",
  "grade": "grade designation visible (e.g. Technical Grade, Food Grade, USP), or null",
  "weight": "net weight or quantity as written (e.g. 25 KG, 200L), or null",
  "packaging": "packaging type described (e.g. Polypropylene Bag, Plastic Drum, HDPE Container), or null",
  "visible_text": ["every significant line of text read from the image in order"],
  "specifications": [{"parameter": "name", "value": "value"}],
  "confidence_score": 0
}

confidence_score: rate 0-100 how clearly you could read the label.
- 90-100: label very clear, all key fields readable
- 70-89: most text readable, some fields unclear
- 50-69: partial text readable, significant gaps
- 0-49: very poor image quality or illegible

If you cannot see any product label clearly, return confidence_score of 0 and null for all fields except visible_text which should be [].
"""


def analyze_product_image_vision(image_b64_list=None, image_url_list=None):
    """
    Stage 1: Perform OpenAI Vision Analysis and OCR on product images.
    Returns a tuple of (result_dict, diagnostics_dict).
    Raises Exception if analysis cannot proceed.
    """
    diagnostics = {
        "image_uploaded": False,
        "image_sent": False,
        "vision_received": False,
        "extracted_text": "None",
        "detected_product": "None",
        "confidence_score": 0
    }

    # Validate inputs
    has_b64 = bool(image_b64_list and len(image_b64_list) > 0)
    has_urls = bool(image_url_list and len(image_url_list) > 0)

    if not has_b64 and not has_urls:
        raise Exception("Image analysis failed. No product images were provided.")

    diagnostics["image_uploaded"] = True

    if is_mock_mode():
        logger.warning(
            "OPENAI_API_KEY is not configured — Vision analysis is running in mock mode. "
            "Set a valid OPENAI_API_KEY in your .env file to enable real image analysis."
        )
        # Return an honest mock that makes it obvious it's not real
        mock_result = {
            "product_name": None,
            "brand": None,
            "manufacturer": None,
            "grade": None,
            "weight": None,
            "packaging": None,
            "visible_text": ["[MOCK MODE — Configure OPENAI_API_KEY for real Vision analysis]"],
            "specifications": [],
            "confidence_score": 0,
            "_mock": True,
        }
        diagnostics["image_sent"] = False
        diagnostics["vision_received"] = False
        diagnostics["extracted_text"] = "[MOCK MODE — no real analysis performed]"
        diagnostics["detected_product"] = "MOCK MODE"
        diagnostics["confidence_score"] = 0
        return mock_result, diagnostics

    # Build the message content
    user_parts = [{"type": "text", "text": VISION_USER_PROMPT}]

    # Add base64 images
    if has_b64:
        for b64_data in image_b64_list:
            user_parts.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{b64_data}",
                    "detail": "high"   # Use high detail for better OCR
                }
            })

    # Add URL images
    if has_urls:
        for url in image_url_list:
            if url and url.startswith('http'):
                user_parts.append({
                    "type": "image_url",
                    "image_url": {
                        "url": url,
                        "detail": "high"
                    }
                })

    try:
        diagnostics["image_sent"] = True
        api_key = getattr(settings, 'OPENAI_API_KEY', '').strip()
        client = openai.OpenAI(api_key=api_key)

        # Use gpt-4o for vision — gpt-4o-mini has poor OCR accuracy on labels
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": VISION_SYSTEM_PROMPT},
                {"role": "user", "content": user_parts}
            ],
            temperature=0.0,
            response_format={"type": "json_object"},
            max_tokens=2000,
        )

        content_str = response.choices[0].message.content.strip()
        result = json.loads(content_str)

        # Ensure all required keys exist
        defaults = {
            "product_name": None,
            "brand": None,
            "manufacturer": None,
            "grade": None,
            "weight": None,
            "packaging": None,
            "visible_text": [],
            "specifications": [],
            "confidence_score": 0,
        }
        for key, default in defaults.items():
            if key not in result:
                result[key] = default

        # Ensure list fields are lists
        if not isinstance(result.get("visible_text"), list):
            result["visible_text"] = []
        if not isinstance(result.get("specifications"), list):
            result["specifications"] = []

        # Clamp confidence score
        try:
            result["confidence_score"] = max(0, min(100, int(result["confidence_score"])))
        except (TypeError, ValueError):
            result["confidence_score"] = 0

        diagnostics["vision_received"] = True
        diagnostics["extracted_text"] = ", ".join(result["visible_text"]) or "No text detected"
        diagnostics["detected_product"] = result.get("product_name") or "Not identified"
        diagnostics["confidence_score"] = result["confidence_score"]

        logger.info(
            f"Vision analysis complete: product='{diagnostics['detected_product']}', "
            f"confidence={diagnostics['confidence_score']}%, "
            f"text_lines={len(result['visible_text'])}"
        )

        return result, diagnostics

    except openai.AuthenticationError:
        raise Exception(
            "OpenAI API key is invalid or expired. "
            "Please update OPENAI_API_KEY in your .env file."
        )
    except openai.RateLimitError:
        raise Exception(
            "OpenAI rate limit reached. Please wait a moment and try again."
        )
    except openai.BadRequestError as e:
        raise Exception(
            f"The image could not be processed by OpenAI Vision. "
            f"Ensure the image is clear and not corrupted. Details: {str(e)}"
        )
    except Exception as e:
        logger.error(f"OpenAI Vision API error: {str(e)}", exc_info=True)
        raise Exception(
            f"Image analysis failed. Unable to generate accurate product information. "
            f"Error: {str(e)}"
        )
