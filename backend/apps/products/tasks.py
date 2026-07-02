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
from .models import Product, SiteSetting


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
        self.drawCentredString(0, 0, "KIVI CHEMICALS")
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


@shared_task(name="apps.products.tasks.generate_product_datasheet_task")
def generate_product_datasheet_task(product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return f"Product {product_id} not found."

    # Retrieve site settings
    settings_obj = SiteSetting.get_solo()
    company_name = settings_obj.company_name or "Kivi Industrial Chemicals Limited"
    company_address = settings_obj.address or "Nairobi, Kenya"
    company_phone = settings_obj.phone or "+254 700 000000"
    company_email = settings_obj.email or "info@kivichemicals.com"
    company_url = "www.kivichemicals.com"

    # Setup styles
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#002040"),
        spaceAfter=15
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#00A0C0"),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#334155")
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=colors.HexColor("#002040")
    )

    meta_val = ParagraphStyle(
        'MetaValue',
        fontName='Courier',
        fontSize=10,
        leading=12,
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
    grade_str = f"Grade: {product.grade or 'Industrial Grade'}"
    if product.chemical_formula:
        grade_str += f" | Formula: {product.chemical_formula}"
    story.append(Paragraph(grade_str, ParagraphStyle('Sub', fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=colors.HexColor("#64748B"), spaceAfter=15)))
    
    story.append(Spacer(1, 10))

    # Core Identifiers Table
    meta_data = [
        [Paragraph("CAS Number", meta_label), Paragraph(product.cas_number or "N/A", meta_val),
         Paragraph("UN Number", meta_label), Paragraph(product.un_number or "N/A", meta_val)],
        [Paragraph("Purity", meta_label), Paragraph(product.purity or "N/A", meta_val),
         Paragraph("Molecular Weight", meta_label), Paragraph(product.molecular_weight or "N/A", meta_val)],
        [Paragraph("Appearance", meta_label), Paragraph(product.appearance or "N/A", meta_val),
         Paragraph("Grade Standard", meta_label), Paragraph(product.grade or "N/A", meta_val)]
    ]
    
    meta_table = Table(meta_data, colWidths=[120, 130, 120, 130])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#F1F5F9")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))

    # Short Description
    story.append(Paragraph("PRODUCT DESCRIPTION", section_heading))
    desc_text = product.description or product.short_description or "High purity chemical formulation engineered for industrial process optimizations."
    story.append(Paragraph(desc_text, body_style))
    story.append(Spacer(1, 12))

    # Technical Specifications
    if product.specifications:
        story.append(Paragraph("TECHNICAL SPECIFICATIONS", section_heading))
        spec_rows = [[Paragraph("<b>Parameter</b>", meta_label), Paragraph("<b>Specification Value</b>", meta_label)]]
        for key, val in product.specifications.items():
            spec_rows.append([Paragraph(str(key), body_style), Paragraph(str(val), meta_val)])
        
        spec_table = Table(spec_rows, colWidths=[250, 250])
        spec_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ]))
        story.append(spec_table)
        story.append(Spacer(1, 12))

    # Applications
    if product.applications:
        story.append(Paragraph("RECOMMENDED APPLICATIONS", section_heading))
        bullet_style = ParagraphStyle('Bullet', parent=body_style, leftIndent=15, bulletIndent=5)
        for app in product.applications:
            story.append(Paragraph(f"&bull; {app}", bullet_style))
        story.append(Spacer(1, 12))

    # Safety & Handling
    if product.safety_info:
        story.append(Paragraph("SAFETY, STORAGE & HANDLING GUIDELINES", section_heading))
        story.append(Paragraph(product.safety_info, body_style))
        story.append(Spacer(1, 15))

    # Disclaimer
    story.append(Spacer(1, 10))
    disclaimer_style = ParagraphStyle('Disclaimer', parent=body_style, fontSize=7.5, leading=10, textColor=colors.HexColor("#94A3B8"))
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
