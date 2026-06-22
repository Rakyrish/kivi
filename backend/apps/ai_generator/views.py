import json
import openai
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status


class GenerateProductContentView(APIView):
    """
    POST /api/ai/generate-product/
    Body: { "product_name": "Sodium Hydroxide", "category": "Alkalies" }
    Returns: full product content JSON ready to populate the admin form
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        product_name = request.data.get('product_name', '').strip()
        category = request.data.get('category', '').strip()

        if not product_name:
            return Response(
                {'error': 'product_name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Fallback/Mock content generation if OpenAI API key is missing or mock
        api_key = getattr(settings, 'OPENAI_API_KEY', '')
        if not api_key or 'mock' in api_key.lower() or api_key == '':
            mock_content = {
                "short_description": f"High-quality {product_name} optimized for commercial and industrial use in Kenya and East Africa.",
                "description": f"{product_name} is a versatile compound widely utilized in Kenyan manufacturing, processing, and agricultural industries. It serves as a vital component for synthesis, cleaning, or specialized applications, ensuring compliance with local quality standards. Our product provides reliable quality and consistent purity for demanding industrial processes.",
                "chemical_formula": "NaOH" if "sodium" in product_name.lower() else "HCl" if "acid" in product_name.lower() else "C6H12O6",
                "cas_number": "1310-73-2" if "sodium" in product_name.lower() else "7647-01-0" if "acid" in product_name.lower() else "50-99-7",
                "grade": "Industrial Grade",
                "un_number": "UN1823" if "sodium" in product_name.lower() or "acid" in product_name.lower() else "",
                "applications": [
                    "Industrial chemical manufacturing and formulation",
                    "Water treatment and pH adjustment systems",
                    "Processing agent in local factories",
                    "Sanitisation and surface preparation"
                ],
                "specifications": {
                    "Purity": "99.0% min",
                    "Form": "Crystalline / Powder / Liquid",
                    "Density": "Standard density for grade",
                    "Moisture": "0.5% max"
                },
                "safety_info": "Handle with care. Wear chemical-resistant gloves and goggles. Store in a dry, ventilated warehouse.",
                "seo_title": f"Buy {product_name} Kenya | Kivi Industrial Chemicals",
                "seo_description": f"Get premium grade {product_name} in Nairobi, Kenya. Trusted B2B chemical supplier offering reliable delivery across East Africa.",
                "keywords": f"{product_name} Kenya, buy {product_name} Nairobi, chemical supplier East Africa, {product_name} supplier",
                "ai_generated": True
            }
            return Response(mock_content)

        client = openai.OpenAI(api_key=api_key)
        model = getattr(settings, 'OPENAI_MODEL', 'gpt-4o-mini')

        prompt = f"""
You are an expert technical content writer for an industrial chemical supplier in Kenya.
Generate complete, accurate product content for: "{product_name}"
Category: {category if category else 'Industrial Chemicals'}
Target market: Kenya and East Africa (B2B buyers — plant managers, procurement officers)

Return ONLY a valid JSON object with this exact structure, no markdown, no preamble:
{{
  "short_description": "2-3 sentences, max 280 chars, plain language",
  "description": "Full product description 400-600 words. Cover: what it is, chemical properties, how it is used, why Kenyan industries rely on it. Mention specific local industries where relevant. No bullet points — flowing paragraphs.",
  "chemical_formula": "Standard chemical formula e.g. NaOH. Empty string if not applicable.",
  "cas_number": "CAS registry number e.g. 1310-73-2. Empty string if unknown.",
  "grade": "e.g. Industrial Grade, Food Grade, Technical Grade, Laboratory Grade",
  "un_number": "UN hazmat number if applicable e.g. UN1823. Empty string if not hazardous.",
  "applications": ["application 1", "application 2", "application 3", "application 4", "application 5"],
  "specifications": {{
    "Purity": "e.g. 99% min",
    "Form": "e.g. White pellets / Liquid / Powder",
    "Molecular Weight": "e.g. 40.00 g/mol",
    "pH (1% solution)": "e.g. 13-14"
  }},
  "safety_info": "2-3 sentences on safe handling, storage requirements, and key hazards.",
  "seo_title": "Buy [Product Name] Kenya | Kivi Industrial Chemicals — max 60 chars",
  "seo_description": "Compelling meta description mentioning Kenya/Nairobi, max 160 chars",
  "keywords": "comma-separated keywords: product name Kenya, buy product Nairobi, product supplier East Africa, etc."
}}
"""

        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.6,
                response_format={"type": "json_object"},
                max_tokens=1500,
            )
            content = json.loads(response.choices[0].message.content)
            content['ai_generated'] = True
            return Response(content)

        except openai.AuthenticationError:
            return Response(
                {'error': 'Invalid OpenAI API key'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except openai.RateLimitError:
            return Response(
                {'error': 'OpenAI quota exceeded. Please try again later.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
