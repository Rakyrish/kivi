import io
import os
from celery import shared_task
from django.conf import settings
from django.core.files.base import ContentFile
import cloudinary.uploader
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
from .models import Product, SiteSetting, TechnicalDataSheet


class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute total pages and draw headers/footers
    with Kivi branding and watermarks.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # 1. Subtle Watermark Text in center
        self.setFont("Helvetica-Bold", 60)
        self.setFillColor(colors.HexColor("#002040"), alpha=0.03)
        self.translate(300, 400)
        self.rotate(45)
        self.drawCentredString(0, 0, "KIVI CHEMICALS LTD")
        self.restoreState()

        # 2. Header (drawn on all pages)
        self.saveState()
        self.setStrokeColor(colors.HexColor("#00A0C0"))
        self.setLineWidth(1)
        self.line(54, 730, 558, 730)
        
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#002040"))
        self.drawString(54, 735, "KIVI INDUSTRIAL CHEMICALS LIMITED")
        self.setFont("Helvetica-Oblique", 8)
        self.setFillColor(colors.HexColor("#606060"))
        self.drawRightString(558, 735, "TECHNICAL DATASHEET")
        self.restoreState()

        # 3. Footer
        self.saveState()
        self.setStrokeColor(colors.HexColor("#E8EEF4"))
        self.setLineWidth(0.5)
        self.line(54, 60, 558, 60)
        
        self.setFont("Helvetica", 7)
        self.setFillColor(colors.HexColor("#606060"))
        self.drawString(54, 48, "Address: Nairobi, Kenya | Email: info@kivichemicals.com | Web: www.kivichemicals.com")
        self.drawRightString(558, 48, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def regenerate_product_content(product_id):
    """
    Rewrites a product's content in place with the full 10-section generation engine.

    URL preservation guarantees: slug, image(s), category, documents, inventory,
    and analytics counters are never touched. Only content and SEO metadata change.
    The post_save signal then refreshes the TDS PDF automatically.

    Raises on generation failure (the Celery wrapper retries; sync callers surface it).
    """
    from apps.ai_generator.generation import generate_product_content, CONTENT_FIELDS, IDENTITY_FIELDS
    from apps.analytics.utils import log_ai_action

    try:
        product = Product.objects.select_related('category').get(id=product_id)
    except Product.DoesNotExist:
        return f"Product {product_id} not found."

    existing = {
        'name': product.name,
        'category': product.category.name if product.category else '',
        'chemical_formula': product.chemical_formula,
        'cas_number': product.cas_number,
        'un_number': product.un_number,
        'grade': product.grade,
        'purity': product.purity,
        'molecular_weight': product.molecular_weight,
        'appearance': product.appearance,
        'applications': product.applications,
        'specifications': product.specifications,
        'packaging': product.packaging,
        'short_description': product.short_description,
    }

    try:
        content, tokens = generate_product_content(
            product_name=product.name,
            category=existing['category'],
            image_url_list=product.images or ([product.image] if product.image else None),
            existing=existing,
        )
    except Exception as e:
        log_ai_action("product_text", product.name, "error", 0, str(e), triggered_by="regeneration")
        raise

    original_slug = product.slug
    for field in CONTENT_FIELDS:
        setattr(product, field, content[field])
    # Identity facts: only fill blanks — never overwrite verified chemistry data.
    for field in IDENTITY_FIELDS:
        if not getattr(product, field):
            setattr(product, field, content[field])

    product.ai_generated = True
    product.slug = original_slug  # URL is permanent
    product.save()

    log_ai_action("product_text", product.name, "success", tokens, triggered_by="regeneration")
    return f"Regenerated content for '{product.name}' (slug preserved: {original_slug})"


@shared_task(name="apps.products.tasks.regenerate_product_content_task", bind=True, max_retries=2, default_retry_delay=120)
def regenerate_product_content_task(self, product_id):
    try:
        return regenerate_product_content(product_id)
    except Exception as e:
        raise self.retry(exc=e)


@shared_task(name="apps.products.tasks.generate_product_datasheet_task")
def generate_product_datasheet_task(product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return f"Product {product_id} not found."

    # Fetch TDS if available
    tds = getattr(product, 'tds', None)

    # Resolve properties (fallback to product model fields)
    chem_formula = (tds.chemical_formula if tds and tds.chemical_formula else product.chemical_formula) or "N/A"
    purity = (tds.purity if tds and tds.purity else product.purity) or "N/A"
    appearance = (tds.appearance if tds and tds.appearance else product.appearance) or "N/A"
    grade = (tds.grade if tds and hasattr(tds, 'grade') else product.grade) or "N/A"
    
    # physical/chemical properties
    solubility = (tds.solubility if tds else "") or "N/A"
    density = (tds.density if tds else "") or "N/A"
    ph_val = (tds.ph if tds else "") or "N/A"
    
    # descriptions
    desc_text = (tds.product_description if tds and tds.product_description else product.description or product.short_description) or "High purity chemical formulation engineered for industrial process optimizations."
    
    # specs
    specs = (tds.technical_specifications if tds and tds.technical_specifications else product.specifications) or {}
    
    # applications
    apps = (tds.industrial_applications if tds and tds.industrial_applications else product.applications) or []
    
    # packing & storage
    packaging = (tds.packaging if tds and tds.packaging else ", ".join([f"{p['size']} {p['type']}" for p in product.packaging if 'size' in p]) if product.packaging else "N/A")
    storage = (tds.storage_conditions if tds and tds.storage_conditions else "Store in a cool, dry, well-ventilated area away from incompatible substances.")
    shelf_life = (tds.shelf_life if tds and tds.shelf_life else "N/A")
    
    # safety
    safety_notes = (tds.safety_notes if tds and tds.safety_notes else product.safety_info) or "Wear appropriate personal protective equipment. Avoid contact with eyes, skin, and clothing."
    handling = (tds.handling_recommendations if tds and tds.handling_recommendations else "Handle in accordance with good industrial hygiene and safety practices.")

    # Setup styles
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#002040"),
        spaceAfter=12
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#00A0C0"),
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155")
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor("#002040")
    )

    meta_val = ParagraphStyle(
        'MetaValue',
        fontName='Courier',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor("#0F172A")
    )

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=80,
        bottomMargin=80
    )

    story = []

    # Title & Chemical Name
    story.append(Paragraph(product.name.upper(), title_style))
    
    # Subtitle / Grade
    grade_str = f"Grade: {grade or 'Industrial Grade'}"
    if chem_formula and chem_formula != "N/A":
        grade_str += f" | Formula: {chem_formula}"
    story.append(Paragraph(grade_str, ParagraphStyle('Sub', fontName='Helvetica-Bold', fontSize=10, leading=12, textColor=colors.HexColor("#64748B"), spaceAfter=12)))
    
    story.append(Spacer(1, 5))

    # Core Identifiers Table
    meta_data = [
        [Paragraph("CAS Number", meta_label), Paragraph(product.cas_number or "N/A", meta_val),
         Paragraph("UN Number", meta_label), Paragraph(product.un_number or "N/A", meta_val)],
        [Paragraph("Purity", meta_label), Paragraph(purity, meta_val),
         Paragraph("Molecular Weight", meta_label), Paragraph(product.molecular_weight or "N/A", meta_val)],
        [Paragraph("Appearance", meta_label), Paragraph(appearance, meta_val),
         Paragraph("Grade Standard", meta_label), Paragraph(grade, meta_val)]
    ]
    
    meta_table = Table(meta_data, colWidths=[120, 130, 120, 130])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#F1F5F9")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # Short Description
    story.append(Paragraph("PRODUCT DESCRIPTION", section_heading))
    story.append(Paragraph(desc_text, body_style))
    story.append(Spacer(1, 8))

    # Technical Specifications
    if specs:
        story.append(Paragraph("TECHNICAL SPECIFICATIONS", section_heading))
        spec_rows = [[Paragraph("<b>Parameter</b>", meta_label), Paragraph("<b>Specification Value</b>", meta_label)]]
        for key, val in specs.items():
            spec_rows.append([Paragraph(str(key), body_style), Paragraph(str(val), meta_val)])
        
        spec_table = Table(spec_rows, colWidths=[250, 250])
        spec_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ]))
        story.append(spec_table)
        story.append(Spacer(1, 8))

    # Physical & Chemical Properties
    if tds:
        story.append(Paragraph("PHYSICAL & CHEMICAL PROPERTIES", section_heading))
        prop_data = [
            [Paragraph("Solubility", meta_label), Paragraph(solubility, body_style)],
            [Paragraph("Density", meta_label), Paragraph(density, body_style)],
            [Paragraph("pH Value", meta_label), Paragraph(ph_val, body_style)]
        ]
        prop_table = Table(prop_data, colWidths=[150, 350])
        prop_table.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#F1F5F9")),
            ('PADDING', (0,0), (-1,-1), 4),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(prop_table)
        story.append(Spacer(1, 8))

    # Applications
    if apps:
        story.append(Paragraph("RECOMMENDED APPLICATIONS", section_heading))
        bullet_style = ParagraphStyle('Bullet', parent=body_style, leftIndent=12, bulletIndent=4)
        for app in apps:
            story.append(Paragraph(f"&bull; {app}", bullet_style))
        story.append(Spacer(1, 8))

    # Packaging & Storage
    story.append(Paragraph("PACKAGING & STORAGE CONDITIONS", section_heading))
    pack_data = [
        [Paragraph("Packaging", meta_label), Paragraph(packaging, body_style)],
        [Paragraph("Storage Conditions", meta_label), Paragraph(storage, body_style)],
        [Paragraph("Shelf Life", meta_label), Paragraph(shelf_life, body_style)]
    ]
    pack_table = Table(pack_data, colWidths=[150, 350])
    pack_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#F1F5F9")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(pack_table)
    story.append(Spacer(1, 8))

    # Safety & Handling
    story.append(Paragraph("SAFETY, STORAGE & HANDLING GUIDELINES", section_heading))
    story.append(Paragraph(f"<b>Handling:</b> {handling}", body_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph(f"<b>Safety Precautions:</b> {safety_notes}", body_style))
    story.append(Spacer(1, 10))

    # Disclaimer
    disclaimer_style = ParagraphStyle('Disclaimer', parent=body_style, fontSize=7, leading=9, textColor=colors.HexColor("#94A3B8"))
    story.append(Paragraph(
        "<b>Disclaimer:</b> The information provided in this Technical Datasheet is based on our current knowledge and experience. "
        "It is the user's responsibility to verify suitability for their specific formulations and comply with local regulations.",
        disclaimer_style
    ))

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    
    # Get PDF bytes
    pdf_data = buffer.getvalue()
    buffer.close()

    # Upload to Cloudinary using secure raw mode
    filename = f"datasheet_{product.slug}.pdf"
    try:
        upload_result = cloudinary.uploader.upload(
            ContentFile(pdf_data, name=filename),
            resource_type='raw',
            public_id=f"datasheets/{product.slug}",
            overwrite=True
        )
        pdf_url = upload_result.get('secure_url')
        
        # Save to DB without triggering signals recursively
        Product.objects.filter(id=product.id).update(datasheet_pdf=pdf_url)
        return f"Successfully generated and uploaded datasheet for {product.name}: {pdf_url}"
    except Exception as e:
        return f"Cloudinary upload failed for {product.name} datasheet: {str(e)}"
