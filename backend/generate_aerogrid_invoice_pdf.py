import os
import shutil
import hashlib
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_LEFT, TA_CENTER

def generate_irn():
    random_bytes = os.urandom(32)
    return hashlib.sha256(random_bytes).hexdigest()

def create_invoice_pdf(output_path, inv_num="AG-2026-AI-8832"):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A')
    )

    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )

    bold_body_style = ParagraphStyle(
        'BoldBodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )

    irn_style = ParagraphStyle(
        'IRNStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#475569')
    )

    elements = []

    # 1. Title & Tax Invoice Badge
    title_data = [
        [
            Paragraph("<b>TAX INVOICE</b>", header_style),
            Paragraph("<font color='#059669'><b>ORIGINAL FOR RECIPIENT</b></font><br/><font color='#64748B' size='8'>E-Invoice compliant with Rule 48(4) of CGST Rules</font>", ParagraphStyle('R', parent=styles['Normal'], alignment=TA_RIGHT, leading=11))
        ]
    ]
    t_title = Table(title_data, colWidths=[270, 270])
    t_title.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_title)
    elements.append(Spacer(1, 8))

    # 2. IRN Box
    irn = generate_irn()
    ack_num = f"112026{int(datetime.now().timestamp())}"
    irn_box_data = [
        [
            Paragraph(f"<b>IRN (Invoice Reference Number):</b><br/>{irn}", irn_style),
            Paragraph(f"<b>Ack No:</b> {ack_num}<br/><b>Ack Date:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ParagraphStyle('Ack', parent=styles['Normal'], fontSize=7.5, leading=10, textColor=colors.HexColor('#475569'), alignment=TA_RIGHT))
        ]
    ]
    t_irn = Table(irn_box_data, colWidths=[400, 140])
    t_irn.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(t_irn)
    elements.append(Spacer(1, 10))

    # 3. Seller and Buyer details
    seller_html = """
    <b>Sold by / Supplier (MSME):</b><br/>
    <b>AeroGrid AI Solutions Pvt. Ltd.</b><br/>
    Unit 402, Infinity High-Tech Tower, Viman Nagar<br/>
    Pune, Maharashtra 411014<br/>
    <b>GSTIN:</b> 27AAGCA4489J1Z4<br/>
    <b>PAN:</b> AAGCA4489J | <b>State:</b> Maharashtra (27)
    """

    buyer_html = """
    <b>Bill to / Corporate Buyer:</b><br/>
    <b>Infosys Limited</b><br/>
    Plot No. 44, Electronics City, Hosur Road<br/>
    Bengaluru, Karnataka 560100<br/>
    <b>GSTIN:</b> 29AAACI1681G1Z0<br/>
    <b>PAN:</b> AAACI1681G | <b>State:</b> Karnataka (29)
    """

    from datetime import timedelta
    inv_date_obj = datetime.now() - timedelta(days=5)
    due_date_obj = datetime.now() + timedelta(days=70)
    inv_date_str = inv_date_obj.strftime('%d/%m/%Y')
    due_date_str = due_date_obj.strftime('%d/%m/%Y')

    meta_html = f"""
    <b>Invoice No:</b> {inv_num}<br/>
    <b>Date of Invoice:</b> {inv_date_str}<br/>
    <b>Payment Due Date:</b> {due_date_str}<br/>
    <b>Payment Terms:</b> Net 75 Days<br/>
    <b>Place of Supply:</b> 29-Karnataka (Inter-State IGST)
    """

    parties_data = [
        [
            Paragraph(seller_html, body_style),
            Paragraph(buyer_html, body_style),
            Paragraph(meta_html, body_style)
        ]
    ]
    t_parties = Table(parties_data, colWidths=[185, 185, 170])
    t_parties.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FFFFFF')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    elements.append(t_parties)
    elements.append(Spacer(1, 14))

    # 4. Itemized Table
    item_header = [
        Paragraph("<b>#</b>", bold_body_style),
        Paragraph("<b>Item Description & Engineering Deliverables</b>", bold_body_style),
        Paragraph("<b>HSN/SAC</b>", bold_body_style),
        Paragraph("<b>Qty</b>", bold_body_style),
        Paragraph("<b>Unit Price (INR)</b>", ParagraphStyle('R', parent=bold_body_style, alignment=TA_RIGHT)),
        Paragraph("<b>Amount (INR)</b>", ParagraphStyle('R', parent=bold_body_style, alignment=TA_RIGHT)),
    ]

    items = [
        [
            Paragraph("1", body_style),
            Paragraph("<b>Autonomous Edge AI Computing Nodes (Phase 2 Deployment)</b><br/><font size='7.5' color='#64748B'>High-throughput edge tensor accelerator clusters for real-time telemetry processing</font>", body_style),
            Paragraph("847150", body_style),
            Paragraph("2 Units", body_style),
            Paragraph("INR 7,50,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
            Paragraph("INR 15,00,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
        ],
        [
            Paragraph("2", body_style),
            Paragraph("<b>Distributed Model Mesh Architecture & Cloud Infrastructure</b><br/><font size='7.5' color='#64748B'>High-availability low-latency microservices pipeline with Kubernetes orchestration</font>", body_style),
            Paragraph("998313", body_style),
            Paragraph("1 Set", body_style),
            Paragraph("INR 6,00,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
            Paragraph("INR 6,00,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
        ],
        [
            Paragraph("3", body_style),
            Paragraph("<b>Enterprise AI Reliability & SLA Monitoring Suite</b><br/><font size='7.5' color='#64748B'>Quarterly 24/7 dedicated engineering support and real-time observability telemetry</font>", body_style),
            Paragraph("998314", body_style),
            Paragraph("1 Qtr", body_style),
            Paragraph("INR 3,00,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
            Paragraph("INR 3,00,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
        ]
    ]

    table_data = [item_header] + items
    t_items = Table(table_data, colWidths=[25, 235, 60, 45, 85, 90])
    t_items.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_items)
    elements.append(Spacer(1, 10))

    # 5. Calculation Summary
    summary_data = [
        [
            Paragraph("<b>Amount in Words:</b><br/>Rupees Twenty-Eight Lakh Thirty-Two Thousand Only", body_style),
            Paragraph("<b>Subtotal / Taxable Value:</b>", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
            Paragraph("INR 24,00,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT))
        ],
        [
            "",
            Paragraph("<b>Integrated GST (IGST @ 18%):</b>", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
            Paragraph("INR 4,32,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT))
        ],
        [
            "",
            Paragraph("<b>Total Invoice Amount:</b>", ParagraphStyle('R_Bold', parent=bold_body_style, alignment=TA_RIGHT, fontSize=11, textColor=colors.HexColor('#0F172A'))),
            Paragraph("<b>INR 28,32,000.00</b>", ParagraphStyle('R_Bold', parent=bold_body_style, alignment=TA_RIGHT, fontSize=11, textColor=colors.HexColor('#059669')))
        ]
    ]

    t_summary = Table(summary_data, colWidths=[280, 160, 100])
    t_summary.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 4),
        ('LINEABOVE', (1,2), (2,2), 1, colors.HexColor('#0F172A')),
    ]))
    elements.append(t_summary)
    elements.append(Spacer(1, 14))

    # 6. Banking & Terms
    bank_html = """
    <b>Direct Settlement Banking Mandate:</b><br/>
    <b>Account Name:</b> AeroGrid AI Solutions Pvt. Ltd.<br/>
    <b>Bank Name:</b> HDFC Bank Ltd, Viman Nagar Branch<br/>
    <b>Account Number:</b> 50200088991244<br/>
    <b>IFSC Code:</b> HDFC0001248<br/>
    <i>*Linked with Polygon Amoy Escrow Smart Contract Vault</i>
    """

    auth_html = """
    <br/><br/>
    <b>For AeroGrid AI Solutions Pvt. Ltd.</b><br/><br/><br/>
    <b>Authorized Signatory / E-Signed</b><br/>
    <font color='#64748B' size='7'>Digitally cryptographically signed on 08/08/2026</font>
    """

    bottom_data = [
        [
            Paragraph(bank_html, body_style),
            Paragraph(auth_html, ParagraphStyle('Auth', parent=body_style, alignment=TA_RIGHT))
        ]
    ]
    t_bottom = Table(bottom_data, colWidths=[320, 220])
    t_bottom.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F8FAFC')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    elements.append(t_bottom)

    doc.build(elements)
    print(f"Successfully generated invoice PDF at: {output_path}")

if __name__ == "__main__":
    import random
    unique_suffix = random.randint(1000, 9999)
    inv_code = f"AG-2026-AI-{unique_suffix}"
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, ".."))
    
    # Save directly in project root
    v2_pdf = os.path.join(project_root, "Sample_Invoice_Infosys_AeroGrid_AI_v2.pdf")
    create_invoice_pdf(v2_pdf, inv_code)
    
    v1_pdf = os.path.join(project_root, "Sample_Invoice_Infosys_AeroGrid_AI.pdf")
    shutil.copyfile(v2_pdf, v1_pdf)
    
    print(f"Generated fresh unique invoice {inv_code} at:\n1) {v2_pdf}\n2) {v1_pdf}")
