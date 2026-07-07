import json
import base64
import openai
import cloudinary.uploader
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.throttling import ScopedRateThrottle
from rest_framework import status
from apps.analytics.models import ChatMessage
from apps.analytics.utils import log_ai_action
from .analyze_vision import analyze_product_image_vision


def _upload_files_to_cloudinary(uploaded_files):
    """
    Upload a list of InMemoryUploadedFile objects to Cloudinary.
    Returns (cloudinary_urls, fallback_b64_list) — if Cloudinary upload fails
    for a file we fall back to raw base64 so Vision can still analyse it.
    """
    cloudinary_urls = []
    fallback_b64 = []
    for img in uploaded_files:
        try:
            img.seek(0)
            result = cloudinary.uploader.upload(
                img,
                folder="products",
                resource_type="image",
            )
            url = result.get("secure_url", "")
            if url:
                cloudinary_urls.append(url)
                continue
        except Exception:
            pass
        # Fallback: encode to base64 for Vision
        try:
            img.seek(0)
            fallback_b64.append(base64.b64encode(img.read()).decode("utf-8"))
        except Exception:
            pass
    return cloudinary_urls, fallback_b64


def _get_data_list(data, key):
    if hasattr(data, 'getlist'):
        val = data.getlist(key)
        if val:
            return val
    val = data.get(key)
    if not val:
        return []
    if isinstance(val, list):
        return val
    if isinstance(val, str):
        return [u.strip() for u in val.split(',') if u.strip()]
    return [val]


class AnalyzeProductImageView(APIView):
    """
    POST /api/ai/analyze-image/
    Stage 1: Perform OpenAI Vision Analysis and OCR on product images.
    Returns:
    {
      "success": true,
      "diagnostics": {
        "image_uploaded": true,
        "image_sent": true,
        "vision_received": true,
        "extracted_text": "...",
        "detected_product": "...",
        "confidence_score": 95
      },
      "extraction": {
        "product_name": "...",
        "brand": "...",
        ...
      }
    }
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        # Read multiple URLs safely
        image_urls = _get_data_list(request.data, 'image_urls') or _get_data_list(request.data, 'image_url')
        if not image_urls:
            raw_urls = request.data.get('image_urls') or request.data.get('image_url') or ''
            if isinstance(raw_urls, str):
                image_urls = [u.strip() for u in raw_urls.split(',') if u.strip()]
            elif isinstance(raw_urls, list):
                image_urls = raw_urls

        # Read multiple uploaded files
        uploaded_images = request.FILES.getlist('images') or request.FILES.getlist('image')
        if not uploaded_images:
            single_image = request.FILES.get('image')
            if single_image:
                uploaded_images = [single_image]

        # Upload files to Cloudinary; fall back to base64 if Cloudinary is unavailable
        cloudinary_urls, image_b64_list = _upload_files_to_cloudinary(uploaded_images)

        # Merge Cloudinary-hosted URLs with any externally pasted URLs
        all_image_urls = cloudinary_urls + image_urls

        try:
            extraction, diagnostics = analyze_product_image_vision(
                image_b64_list=image_b64_list or None,
                image_url_list=all_image_urls or None,
            )
            # Attach the Cloudinary-hosted URLs to the extraction so the
            # frontend can bind them straight into the product form.
            if not extraction.get('image'):
                extraction['image'] = all_image_urls[0] if all_image_urls else ''
            if not extraction.get('images'):
                extraction['images'] = all_image_urls
            return Response({
                "success": True,
                "diagnostics": diagnostics,
                "extraction": extraction
            })
        except Exception as e:
            diagnostics = {
                "image_uploaded": bool(uploaded_images or image_urls),
                "image_sent": bool(all_image_urls or image_b64_list),
                "vision_received": False,
                "extracted_text": "None",
                "detected_product": "None",
                "confidence_score": 0
            }
            return Response({
                "success": False,
                "error": str(e),
                "diagnostics": diagnostics
            }, status=status.HTTP_400_BAD_REQUEST)


class GenerateProductContentView(APIView):
    """
    POST /api/ai/generate-product/
    Accepts text parameters, pre-extracted vision_data, uploaded images, or URLs.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        from .generation import generate_product_content

        product_name = request.data.get('product_name', '').strip()
        category = request.data.get('category', '').strip()
        
        # Read pre-extracted vision data from request body if available
        vision_data = request.data.get('vision_data')
        if vision_data and isinstance(vision_data, str):
            try:
                vision_data = json.loads(vision_data)
            except Exception:
                vision_data = None

        # Read multiple URLs safely
        image_urls = _get_data_list(request.data, 'image_urls') or _get_data_list(request.data, 'image_url')
        if not image_urls:
            raw_urls = request.data.get('image_urls') or request.data.get('image_url') or ''
            if isinstance(raw_urls, str):
                image_urls = [u.strip() for u in raw_urls.split(',') if u.strip()]
            elif isinstance(raw_urls, list):
                image_urls = raw_urls

        # Read multiple uploaded files
        uploaded_images = request.FILES.getlist('images') or request.FILES.getlist('image')
        if not uploaded_images:
            single_image = request.FILES.get('image')
            if single_image:
                uploaded_images = [single_image]

        # Upload files to Cloudinary; fall back to base64 for Vision if needed
        cloudinary_urls, image_b64_list = _upload_files_to_cloudinary(uploaded_images)
        all_image_urls = cloudinary_urls + image_urls

        # If vision_data already contains image URLs (from Stage 1), honour them
        if vision_data and not vision_data.get('image') and all_image_urls:
            vision_data['image'] = all_image_urls[0]
        if vision_data and not vision_data.get('images') and all_image_urls:
            vision_data['images'] = all_image_urls

        # If vision_data is not provided but images exist, run Stage 1 analysis first
        if not vision_data and (image_b64_list or all_image_urls):
            try:
                vision_data, _ = analyze_product_image_vision(
                    image_b64_list=image_b64_list or None,
                    image_url_list=all_image_urls or None,
                )
                # Attach Cloudinary URLs to freshly-extracted vision data
                if not vision_data.get('image') and all_image_urls:
                    vision_data['image'] = all_image_urls[0]
                if not vision_data.get('images') and all_image_urls:
                    vision_data['images'] = all_image_urls
            except Exception as e:
                return Response(
                    {'error': f"Image analysis failed. Unable to generate accurate product information. Details: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # STRICT RULE: If no product_name and no vision_data, fail copy generation
        if not product_name and not vision_data:
            return Response(
                {'error': 'Image analysis failed. Unable to generate accurate product information.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        target_label = product_name or (vision_data.get('product_name') if vision_data else None) or "Unknown"
        action_type = "product_image" if vision_data else "product_text"

        try:
            content, tokens = generate_product_content(
                product_name=product_name,
                category=category,
                image_b64_list=image_b64_list or None,
                image_url_list=all_image_urls or None,
                vision_data=vision_data,
            )
            # Final safety net: ensure image URLs are in the content response
            if not content.get('image') and all_image_urls:
                content['image'] = all_image_urls[0]
            if not content.get('images') and all_image_urls:
                content['images'] = all_image_urls
            log_ai_action(action_type, content.get('name', target_label), "success", tokens)
            return Response(content)
        except Exception as e:
            log_ai_action(action_type, target_label, "error", 0, str(e))
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


def _build_catalogue_context():
    """Compact product catalogue snapshot injected into the Kivi Agent system prompt."""
    from apps.products.models import Product, Category

    lines = ["PRODUCT CATALOGUE (live from database):"]
    categories = Category.objects.filter(is_active=True).prefetch_related('products')
    for cat in categories:
        lines.append(f"\n## Category: {cat.name} (slug: {cat.slug})")
        products = cat.products.filter(is_active=True)[:40]
        for p in products:
            facts = [f"slug: {p.slug}"]
            if p.chemical_formula:
                facts.append(f"formula: {p.chemical_formula}")
            if p.cas_number:
                facts.append(f"CAS: {p.cas_number}")
            if p.grade:
                facts.append(f"grade: {p.grade}")
            if p.purity:
                facts.append(f"purity: {p.purity}")
            facts.append("in stock" if p.in_stock else "out of stock")
            lines.append(f"- {p.name} ({'; '.join(facts)})")

    uncategorized = Product.objects.filter(is_active=True, category__isnull=True)[:40]
    if uncategorized:
        lines.append("\n## Uncategorized")
        for p in uncategorized:
            lines.append(f"- {p.name} (slug: {p.slug})")

    return "\n".join(lines)


KIVI_AGENT_SYSTEM_PROMPT = """
You are Kivi Agent, the AI assistant of Kivi Industrial Chemicals Limited — a professional
chemical sales and technical support specialist with 10+ years of experience in industrial
chemicals, procurement support, safety compliance, chemical applications, and customer service.

Company facts:
- B2B industrial chemical supplier headquartered in Nairobi, Kenya.
- Delivers across Kenya, Uganda, Tanzania, and the wider East African region.
- Customers request quotations for bulk/B2B orders; there is no online checkout.
- Every product page offers a downloadable Technical Data Sheet (TDS).

Behaviour rules:
1. Answer questions about chemical applications, formulas, CAS numbers, safety handling,
   grades, and industry use cases accurately and professionally. Keep replies concise
   (2-5 sentences) unless the customer asks for detail.
2. SALES: recommend relevant products from the catalogue below, suggest complementary or
   alternative products, mention bulk order availability, and encourage quote requests.
3. Only recommend products that appear in the catalogue. If we do not stock something,
   say so honestly and suggest the closest alternative we do stock.
4. SAFETY: never give guidance that would enable unsafe or illicit use of chemicals.
   For hazardous products, always mention required PPE and safe handling briefly.
5. ESCALATION: when the customer shows high purchase intent (asks for prices, quantities,
   delivery, availability, or wants to order/talk to someone), set "show_contact_options"
   to true so the website can show WhatsApp / Call / Email buttons. Never paste raw phone
   numbers, emails, or URLs into your reply text — the buttons handle that.

You MUST respond with ONLY a valid JSON object (no markdown fences) in this exact shape:
{
  "reply": "your reply text, plain sentences, no raw links",
  "recommended_products": [{"name": "Product Name", "slug": "product-slug"}],
  "show_contact_options": false,
  "suggest_quote": false
}
"recommended_products" may be empty. Set "suggest_quote" true when a quotation request is
the natural next step for the customer.
"""


class KiviAgentView(APIView):
    """
    POST /api/ai/kivi-agent/
    Public customer-facing chatbot. Rate-limited per the 'kivi_agent' scope.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'kivi_agent'

    MAX_MESSAGE_LEN = 1000
    MAX_HISTORY = 12

    def post(self, request):
        message = str(request.data.get('message', '')).strip()[:self.MAX_MESSAGE_LEN]
        session_id = str(request.data.get('session_id', '')).strip()[:64]
        history = request.data.get('history', [])
        if not isinstance(history, list):
            history = []

        if not message:
            return Response({'error': 'message is required'}, status=status.HTTP_400_BAD_REQUEST)

        ChatMessage.objects.create(session_id=session_id, role='user', content=message)

        api_key = getattr(settings, 'OPENAI_API_KEY', '')
        use_mock = not api_key or 'mock' in api_key.lower()

        if use_mock:
            payload = self._mock_reply(message)
            ChatMessage.objects.create(
                session_id=session_id, role='assistant',
                content=payload['reply'], escalated=payload['show_contact_options']
            )
            return Response(payload)

        catalogue = _build_catalogue_context()
        messages = [{"role": "system", "content": f"{KIVI_AGENT_SYSTEM_PROMPT}\n\n{catalogue}"}]
        for hist in history[-self.MAX_HISTORY:]:
            role = hist.get('role')
            content = str(hist.get('content', ''))[:self.MAX_MESSAGE_LEN]
            if role in ('user', 'assistant') and content:
                messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": message})

        client = openai.OpenAI(api_key=api_key)
        try:
            response = client.chat.completions.create(
                model=getattr(settings, 'OPENAI_MODEL', 'gpt-4o-mini'),
                messages=messages,
                temperature=0.5,
                response_format={"type": "json_object"},
                max_tokens=600,
            )
            payload = json.loads(response.choices[0].message.content.strip())
            payload = {
                'reply': str(payload.get('reply', '')).strip() or "I'm sorry, could you rephrase that?",
                'recommended_products': payload.get('recommended_products') or [],
                'show_contact_options': bool(payload.get('show_contact_options')),
                'suggest_quote': bool(payload.get('suggest_quote')),
            }
            tokens = getattr(response.usage, 'total_tokens', 0)
            ChatMessage.objects.create(
                session_id=session_id, role='assistant', content=payload['reply'],
                tokens_used=tokens, escalated=payload['show_contact_options']
            )
            log_ai_action("chat", message[:100], "success", tokens, triggered_by="visitor")
            return Response(payload)
        except Exception as e:
            log_ai_action("chat", message[:100], "error", 0, str(e), triggered_by="visitor")
            return Response(
                {
                    'reply': "I'm having a temporary technical issue. Please reach our sales team directly — they respond quickly.",
                    'recommended_products': [],
                    'show_contact_options': True,
                    'suggest_quote': False,
                },
                status=status.HTTP_200_OK,
            )

    def _mock_reply(self, message):
        """Keyword-driven fallback using live catalogue data when no OpenAI key is set."""
        from apps.products.models import Product

        msg = message.lower()
        intent_words = ('price', 'cost', 'quote', 'order', 'buy', 'deliver', 'quantity', 'bulk', 'available', 'stock')
        high_intent = any(w in msg for w in intent_words)

        matches = Product.objects.filter(is_active=True, name__icontains=message.split()[0])[:3]
        if not matches:
            for word in message.split():
                if len(word) > 3:
                    matches = Product.objects.filter(is_active=True, name__icontains=word)[:3]
                    if matches:
                        break

        recommended = [{'name': p.name, 'slug': p.slug} for p in matches]
        if recommended:
            names = ", ".join(p['name'] for p in recommended)
            reply = (
                f"Yes — we supply {names}. All grades come with a Technical Data Sheet and are "
                f"available for delivery across Kenya, Uganda, and Tanzania. Would you like a quotation?"
            )
        elif high_intent:
            reply = (
                "Our sales team can confirm pricing, availability, and delivery timelines for you right away. "
                "Please use the contact options below and we'll respond promptly."
            )
        else:
            reply = (
                "Welcome to Kivi Chemicals! I can help with product recommendations, chemical applications, "
                "safety guidance, and quotations for industrial chemicals across East Africa. What do you need?"
            )

        return {
            'reply': reply,
            'recommended_products': recommended,
            'show_contact_options': high_intent,
            'suggest_quote': bool(recommended) or high_intent,
        }


class AIBusinessAssistantView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        message = request.data.get('message', '').strip()
        history = request.data.get('history', [])

        if not message:
            return Response({'error': 'message is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Build dynamic context from database
        from apps.products.models import Product, Category
        from apps.analytics.models import SystemError
        from django.db.models import Count

        low_stock_products = Product.objects.filter(is_active=True, product_status='low_stock').values('name', 'current_stock', 'reorder_level')
        out_of_stock_products = Product.objects.filter(is_active=True, product_status='out_of_stock').values('name')
        unresolved_errors = SystemError.objects.filter(status='unresolved').values('error_type', 'source', 'message')[:5]
        category_counts = Category.objects.annotate(p_count=Count('products')).values('name', 'p_count')

        context_str = "CURRENT SYSTEM STATE FOR KIVI CHEMICALS:\n"
        context_str += f"- Total Products: {Product.objects.count()}\n"
        context_str += f"- Categories:\n"
        for cat in category_counts:
            context_str += f"  * {cat['name']}: {cat['p_count']} products\n"
        
        context_str += f"- Low Stock Products:\n"
        if low_stock_products:
            for p in low_stock_products:
                context_str += f"  * {p['name']} (Stock: {p['current_stock']}, Reorder at: {p['reorder_level']})\n"
        else:
            context_str += "  * None\n"
            
        context_str += f"- Out of Stock Products:\n"
        if out_of_stock_products:
            for p in out_of_stock_products:
                context_str += f"  * {p['name']}\n"
        else:
            context_str += "  * None\n"
            
        context_str += f"- Unresolved Errors (last 5):\n"
        if unresolved_errors:
            for err in unresolved_errors:
                context_str += f"  * [{err['error_type']}] in {err['source']}: {err['message']}\n"
        else:
            context_str += "  * None\n"

        api_key = getattr(settings, 'OPENAI_API_KEY', '')
        use_mock = not api_key or 'mock' in api_key.lower() or api_key == ''

        if use_mock:
            msg_lower = message.lower()
            if 'error' in msg_lower or 'bug' in msg_lower:
                if unresolved_errors:
                    err_msg = ", ".join([f"{e['error_type']} in {e['source']}" for e in unresolved_errors])
                    response_text = f"Yes, we currently have unresolved errors in the system: {err_msg}. Let me know if you would like me to draft a plan to resolve them."
                else:
                    response_text = "Good news! There are currently no unresolved system errors in the database."
            elif 'stock' in msg_lower or 'inventory' in msg_lower:
                if low_stock_products:
                    low_msg = ", ".join([f"{p['name']} ({p['current_stock']} left)" for p in low_stock_products])
                    response_text = f"Our records show the following products are low in stock: {low_msg}. We should coordinate with the suppliers to restock."
                else:
                    response_text = "All active products have healthy stock levels above their reorder thresholds."
            elif 'category' in msg_lower or 'categories' in msg_lower:
                cat_msg = ", ".join([f"{c['name']} ({c['p_count']})" for c in category_counts])
                response_text = f"We have {Category.objects.count()} active product categories: {cat_msg}."
            else:
                response_text = f"Hello! I am your Kivi Chemicals B2B AI Assistant. I have analyzed your system dashboard. You currently have {Product.objects.count()} products, {Category.objects.count()} categories, and {SystemError.objects.filter(status='unresolved').count()} unresolved system errors. How can I help you manage the command center today?"
            
            return Response({'response': response_text, 'model': 'mock-gpt'})

        import openai
        client = openai.OpenAI(api_key=api_key)
        messages = [
            {"role": "system", "content": f"You are a helpful, professional AI Business Assistant for Kivi Chemicals B2B platform. You have access to real-time status data through the following context:\n\n{context_str}\n\nUse this data to answer the user's questions accurately. If they ask to write emails, blog outlines, or procurement notes, assist them in a professional B2B business tone."}
        ]
        
        for hist in history:
            messages.append({"role": hist.get('role', 'user'), "content": hist.get('content', '')})
            
        messages.append({"role": "user", "content": message})

        try:
            chat_completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=800,
            )
            response_text = chat_completion.choices[0].message.content.strip()
            return Response({'response': response_text, 'model': 'gpt-4o-mini'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
