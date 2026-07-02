import json
import base64
import openai
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from apps.analytics.models import AIGenerationLog
from django.utils import timezone


def log_ai_action(action_type, target_name, status_str, tokens_used=0, error_message="", triggered_by="admin"):
    """Helper to log AI calls to the database for analytics dashboard audit logs."""
    try:
        AIGenerationLog.objects.create(
            action_type=action_type,
            target_name=target_name,
            status=status_str,
            tokens_used=tokens_used,
            error_message=error_message,
            triggered_by=triggered_by,
            completed_at=timezone.now()
        )
    except Exception:
        pass


class GenerateProductContentView(APIView):
    """
    POST /api/ai/generate-product/
    Accepts text parameters, uploaded image file, or image URL.
    Infers all product properties using GPT-4o vision or text model.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        product_name = request.data.get('product_name', '').strip()
        category = request.data.get('category', '').strip()
        image_url = request.data.get('image_url', '').strip()
        uploaded_image = request.FILES.get('image')

        # Fallback/Mock content generation if OpenAI API key is missing or mock
        api_key = getattr(settings, 'OPENAI_API_KEY', '')
        use_mock = not api_key or 'mock' in api_key.lower() or api_key == ''

        name_to_use = product_name or "Sodium Hydroxide"
        if not product_name and uploaded_image:
            name_to_use = "Inferred Chemical from Image"
        elif not product_name and image_url:
            name_to_use = "Inferred Chemical from URL"

        if use_mock:
            mock_content = {
                "name": name_to_use,
                "short_description": f"High-quality {name_to_use} optimized for commercial and industrial formulation use in Kenya and East Africa.",
                "description": f"{name_to_use} is a premium grade chemical compound engineered to deliver high efficacy in industrial and laboratory setups. Produced to meet international and East African standards, it is utilized across various local industries including water purification, soap manufacturing, and processing plants. It offers high purity and minimal moisture levels to guarantee consistent performance.",
                "chemical_formula": "NaOH" if "sodium" in name_to_use.lower() else "HCl" if "acid" in name_to_use.lower() else "C6H12O6",
                "cas_number": "1310-73-2" if "sodium" in name_to_use.lower() else "7647-01-0" if "acid" in name_to_use.lower() else "50-99-7",
                "grade": "Industrial Grade",
                "un_number": "UN1823" if "sodium" in name_to_use.lower() or "acid" in name_to_use.lower() else "",
                "purity": "99.0% Min",
                "molecular_weight": "40.00 g/mol",
                "appearance": "White crystalline micro-pellets",
                "packaging": [
                    {"size": "25 kg", "type": "Polypropylene Bag"},
                    {"size": "1000 kg", "type": "Bulk Bag"}
                ],
                "applications": [
                    "Industrial chemical manufacturing and synthesis",
                    "Water treatment and pH regulation",
                    "Soap and detergent production lines",
                    "Sanitisation and surface preparation"
                ],
                "specifications": {
                    "Purity": "99.0% min",
                    "Moisture": "0.5% max",
                    "Carbonate (as Na2CO3)": "0.4% max",
                    "Iron (Fe)": "10 ppm max"
                },
                "safety_info": "Highly corrosive. Causes severe skin burns and eye damage. Wear chemical-resistant gloves, protective clothing, and eye/face protection. Store in a dry, tightly closed container in a well-ventilated warehouse.",
                "seo_title": f"Buy {name_to_use} Kenya | Kivi Industrial Chemicals",
                "seo_description": f"Get premium grade {name_to_use} in Nairobi, Kenya. Trusted B2B chemical supplier offering reliable delivery across East Africa.",
                "keywords": f"{name_to_use} Kenya, buy {name_to_use} Nairobi, chemical supplier East Africa, {name_to_use} supplier",
                "ai_title": f"The Role of {name_to_use} in East African Manufacturing",
                "ai_summary": f"A comprehensive guide to sourcing, handling, and utilizing premium {name_to_use} safely.",
                "ai_benefits": [
                    "Guaranteed minimum purity of 99.0% for stable chemical reactions",
                    "NEMA and KEBS compliant sourcing for peace of mind",
                    "Optimal moisture control preventing caking during transit"
                ],
                "ai_faq": [
                    {"question": f"What is the standard packaging size for {name_to_use}?", "answer": "The standard B2B packaging size is 25 kg bags, but we can customize to bulk bags on contract orders."},
                    {"question": "Do you provide Certificate of Analysis (COA)?", "answer": "Yes, every batch delivered includes a physical and digital COA matching global specifications."}
                ],
                "ai_industries": ["Soap & Cosmetics", "Water Treatment", "Textiles", "Mining"],
                "alt_text": f"25kg bag of industrial grade {name_to_use} on warehouse pallet",
                "internal_links": [
                    {"title": "Water Treatment Chemicals Catalog", "slug": "water-treatment"}
                ],
                "external_references": [
                    {"title": "PubChem Compound Summary", "url": "https://pubchem.ncbi.nlm.nih.gov", "nofollow": False}
                ],
                "schema_data": {
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": name_to_use,
                    "description": f"Premium grade {name_to_use} for East African B2B chemical procurement.",
                    "brand": {
                        "@type": "Brand",
                        "name": "Kivi Chemicals"
                    }
                },
                "ai_generated": True
            }
            log_ai_action("product_text", name_to_use, "success")
            return Response(mock_content)

        client = openai.OpenAI(api_key=api_key)
        
        # Prepare content payload for GPT vision or text call
        messages = []
        system_prompt = """
You are an expert technical content writer and Solutions Architect for an industrial chemical supplier in Kenya.
You must infer and generate complete, accurate product content based on the input provided (which might be a chemical name, an uploaded image of a label/product, or an image URL).

Return ONLY a valid JSON object with this exact structure, no markdown wrappers (like ```json), no preamble, no tail text:
{
  "name": "Correct standard chemical name",
  "short_description": "2-3 sentences, max 280 chars, plain language",
  "description": "Full product description 400-600 words. Cover: what it is, chemical properties, how it is used, why Kenyan/East African industries rely on it. Mention specific local industries where relevant. Flowing paragraphs.",
  "chemical_formula": "Standard chemical formula e.g. NaOH. Empty string if not applicable.",
  "cas_number": "CAS registry number e.g. 1310-73-2. Empty string if unknown.",
  "grade": "e.g. Industrial Grade, Food Grade, Technical Grade, Laboratory Grade",
  "un_number": "UN hazmat number if applicable e.g. UN1823. Empty string if not hazardous.",
  "purity": "Standard purity value e.g. 99.0% Min",
  "molecular_weight": "Standard MW e.g. 40.00 g/mol",
  "appearance": "e.g. White crystalline flakes",
  "packaging": [{"size": "25 kg", "type": "Bag"}, {"size": "200 L", "type": "Drum"}],
  "applications": ["application 1", "application 2", "application 3", "application 4"],
  "specifications": {
    "Purity": "e.g. 99.0% min",
    "Moisture": "e.g. 0.5% max"
  },
  "safety_info": "2-3 sentences on safe handling, storage requirements, and key hazards.",
  "seo_title": "Buy [Product Name] Kenya | Kivi Industrial Chemicals — max 60 chars",
  "seo_description": "Compelling meta description mentioning Kenya/Nairobi, max 160 chars",
  "keywords": "comma-separated keywords: product name Kenya, buy product Nairobi, chemical supplier East Africa, etc.",
  "ai_title": "Blog title related to this product e.g. Sourcing High Quality [Name] in East Africa",
  "ai_summary": "1-2 sentences summarizing chemical industrial applications",
  "ai_benefits": ["benefit 1", "benefit 2", "benefit 3"],
  "ai_faq": [{"question": "FAQ question?", "answer": "FAQ answer"}],
  "ai_industries": ["industry 1", "industry 2"],
  "alt_text": "Accessibility alt text for product image",
  "internal_links": [{"title": "Link Title", "slug": "slug"}],
  "external_references": [{"title": "PubChem Reference", "url": "https://pubchem.ncbi.nlm.nih.gov", "nofollow": false}],
  "schema_data": {}
}
"""
        messages.append({"role": "system", "content": system_prompt})

        user_content = []
        user_text = f"Generate details for product name: '{product_name}' in category: '{category}'."
        user_content.append({"type": "text", "text": user_text})

        if uploaded_image:
            image_bytes = uploaded_image.read()
            encoded_image = base64.b64encode(image_bytes).decode('utf-8')
            user_content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{encoded_image}"}
            })
        elif image_url:
            user_content.append({
                "type": "image_url",
                "image_url": {"url": image_url}
            })

        messages.append({"role": "user", "content": user_content})

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.4,
                response_format={"type": "json_object"},
                max_tokens=2000,
            )
            content_str = response.choices[0].message.content.strip()
            content = json.loads(content_str)
            content['ai_generated'] = True
            
            tokens = getattr(response.usage, 'total_tokens', 0)
            log_ai_action("product_text", content.get('name', name_to_use), "success", tokens)
            return Response(content)

        except Exception as e:
            log_ai_action("product_text", name_to_use, "error", 0, str(e))
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GenerateBlogContentView(APIView):
    """
    POST /api/ai/generate-blog/
    Generates a full technical, industrial blog post (1500-3000 words).
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        topic = request.data.get('topic', '').strip()
        keywords = request.data.get('keywords', '').strip()

        if not topic:
            return Response({'error': 'topic is required'}, status=status.HTTP_400_BAD_REQUEST)

        api_key = getattr(settings, 'OPENAI_API_KEY', '')
        use_mock = not api_key or 'mock' in api_key.lower() or api_key == ''

        if use_mock:
            mock_content = {
                "title": f"Innovations in {topic} for East African Processing",
                "slug": "innovations-in-processing-east-africa",
                "content": f"<h2>Introduction to modern processing</h2><p>Industrial manufacturing across Kenya, Uganda, and Tanzania is undergoing a rapid evolution. Sourcing verified chemical grades is central to maintaining regulatory and environmental compliance in local municipalities. Let's analyze how {topic} optimizes operations and reduces long-term operational expenditures.</p><h3>The Science of Quality Formulations</h3><p>Using certified purity grades prevents catalytic contamination during large batch mixings. Plant engineers must assess specific molecular structures to maintain safety parameters during reaction processes. Quality certificates are non-negotiable for regional exports.</p>",
                "summary": f"An in-depth analysis of how {topic} shapes modern chemical processing standardizations across Kenya and the East Africa region.",
                "seo_title": f"Innovations in {topic} Kenya | Kivi Chemicals",
                "seo_description": f"Learn how premium {topic} solutions optimize processing standards for East African manufacturers.",
                "keywords": f"{topic} Kenya, chemical processing Nairobi, industrial standard East Africa",
                "featured_image_prompt": f"Professional corporate photography, clean laboratory glassware, chemical engineering elements, deep blue and teal highlights, high depth of field",
                "faq": [
                    {"question": f"Why is {topic} critical for regional safety compliance?", "answer": "Using verified inputs guarantees product standards that comply with KEBS, TBS, and UN regulatory frameworks."}
                ],
                "internal_links": [],
                "external_references": [
                    {"title": "WHO Safety Frameworks", "url": "https://www.who.int", "nofollow": True}
                ],
                "article_schema": {},
                "quality_score": 92,
                "ai_generated": True
            }
            log_ai_action("blog_manual", topic, "success")
            return Response(mock_content)

        client = openai.OpenAI(api_key=api_key)
        prompt = f"""
You are a senior technical writer for a premium B2B chemical supplier in East Africa.
Generate a comprehensive, professional blog post about: "{topic}"
Keywords to include: {keywords}

The article must be highly technical, authoritative, and cover safety, storage, regional standards (KEBS, TBS, UN guidelines), and industrial applications. It must be between 1500 and 3000 words.

Return ONLY a valid JSON object with this exact structure, no markdown wrappers, no preamble, no tail text:
{{
  "title": "Compelling search-optimized title",
  "slug": "url-friendly-slug",
  "content": "Full article content in valid HTML formatting (h2, h3, p, strong, ul, li). High-density technical writing.",
  "summary": "1-2 sentence overview of the article",
  "seo_title": "SEO title under 60 chars",
  "seo_description": "Meta description under 160 chars",
  "keywords": "comma-separated keyword string",
  "featured_image_prompt": "Detailed AI image generation prompt matching this article",
  "faq": [{{"question": "...", "answer": "..."}}],
  "internal_links": [],
  "external_references": [{{"title": "...", "url": "...", "nofollow": true}}],
  "article_schema": {{}}
}}
"""
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You output JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.6,
                response_format={"type": "json_object"},
                max_tokens=3000,
            )
            content_str = response.choices[0].message.content.strip()
            content = json.loads(content_str)
            content['ai_generated'] = True
            content['quality_score'] = 88  # default baseline score
            
            tokens = getattr(response.usage, 'total_tokens', 0)
            log_ai_action("blog_manual", topic, "success", tokens)
            return Response(content)
        except Exception as e:
            log_ai_action("blog_manual", topic, "error", 0, str(e))
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
