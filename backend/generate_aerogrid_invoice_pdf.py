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

def create_invoice_pdf(output_path):
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
    irn_box_data = [
        [
            Paragraph(f"<b>IRN (Invoice Reference Number):</b><br/>{irn}", irn_style),
            Paragraph("<b>Ack No:</b> 1120268892104<br/><b>Ack Date:</b> 2026-08-08 02:30:15", ParagraphStyle('Ack', parent=styles['Normal'], fontSize=7.5, leading=10, textColor=colors.HexColor('#475569'), alignment=TA_RIGHT))
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
    # BUYER: Infosys Limited
    # SELLER: AeroGrid AI Solutions Pvt. Ltd. (MSME)
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

    meta_html = """
    <b>Invoice No:</b> AG-2026-AI-8831<br/>
    <b>Date of Invoice:</b> 08/08/2026<br/>
    <b>Payment Due Date:</b> 22/10/2026<br/>
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
    out_pdf = os.path.join(os.getcwd(), "Sample_Invoice_Infosys_AeroGrid_AI.pdf")
    create_invoice_pdf(out_pdf)
    root_pdf = os.path.abspath(os.path.join(os.getcwd(), "..", "Sample_Invoice_Infosys_AeroGrid_AI.pdf"))
    shutil.copyfile(out_pdf, root_pdf)
    print(f"Copied sample invoice to root workspace at: {root_pdf}")
