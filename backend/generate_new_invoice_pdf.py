import os
import hashlib
import random
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
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
    
    subhead_style = ParagraphStyle(
        'SubheadStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#2563EB')
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
            Paragraph("<b>Ack No:</b> 1120268849201<br/><b>Ack Date:</b> 2026-08-01 10:15:22", ParagraphStyle('Ack', parent=styles['Normal'], fontSize=7.5, leading=10, textColor=colors.HexColor('#475569'), alignment=TA_RIGHT))
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
    # BUYER IS INFOSYS LIMITED (SAME)
    # SELLER IS NEW: QuantumEdge Cloud & AI Technologies Pvt. Ltd.
    seller_html = """
    <b>Sold by / Vendor:</b><br/>
    <b>QuantumEdge Cloud & AI Technologies Pvt. Ltd.</b><br/>
    Tower 4, Cyber City, Magarpatta Road<br/>
    Hadapsar, Pune, Maharashtra 411028<br/>
    <b>GSTIN:</b> 27AABCQ9876M1Z4<br/>
    <b>PAN:</b> AABCQ9876M | <b>State:</b> Maharashtra (27)
    """

    buyer_html = """
    <b>Bill to / Buyer:</b><br/>
    <b>Infosys Limited</b><br/>
    Plot No. 44, Electronics City, Hosur Road<br/>
    Bengaluru, Karnataka 560100<br/>
    <b>GSTIN:</b> 29AAACI1681G1Z0<br/>
    <b>PAN:</b> AAACI1681G | <b>State:</b> Karnataka (29)
    """

    meta_html = """
    <b>Invoice No:</b> QED-2026-CLOUD-994<br/>
    <b>Date of Invoice:</b> 01/08/2026<br/>
    <b>Payment Due Date:</b> 30/11/2026<br/>
    <b>Payment Terms:</b> Net 120 Days<br/>
    <b>Place of Supply:</b> 29-Karnataka (Inter-state IGST)
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
        Paragraph("<b>Item Description & Services</b>", bold_body_style),
        Paragraph("<b>HSN/SAC</b>", bold_body_style),
        Paragraph("<b>Qty</b>", bold_body_style),
        Paragraph("<b>Unit Price (INR)</b>", ParagraphStyle('R', parent=bold_body_style, alignment=TA_RIGHT)),
        Paragraph("<b>Amount (INR)</b>", ParagraphStyle('R', parent=bold_body_style, alignment=TA_RIGHT)),
    ]

    items = [
        [
            Paragraph("1", body_style),
            Paragraph("<b>Enterprise GPU Acceleration Node</b><br/><font size='7.5' color='#64748B'>NVIDIA H100 Tensor Core 80GB SXM5 Server Rack Cluster</font>", body_style),
            Paragraph("8471", body_style),
            Paragraph("2 Nos", body_style),
            Paragraph("INR 24,00,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
            Paragraph("INR 48,00,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
        ],
        [
            Paragraph("2", body_style),
            Paragraph("<b>Distributed AI Pipeline Software Suite</b><br/><font size='7.5' color='#64748B'>QuantumEdge LLM Training & Realtime Inference License (1-Year)</font>", body_style),
            Paragraph("998313", body_style),
            Paragraph("1 Lic", body_style),
            Paragraph("INR 18,00,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
            Paragraph("INR 18,00,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
        ],
        [
            Paragraph("3", body_style),
            Paragraph("<b>Mission-Critical Edge Interconnect & SLA Support</b><br/><font size='7.5' color='#64748B'>24x7 High-availability enterprise datacenter infrastructure SLA</font>", body_style),
            Paragraph("998314", body_style),
            Paragraph("1 Qtr", body_style),
            Paragraph("INR 9,00,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
            Paragraph("INR 9,00,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
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
            Paragraph("<b>Amount in Words:</b><br/>Rupees Eighty-Eight Lakh Fifty Thousand Only", body_style),
            Paragraph("<b>Subtotal / Taxable Value:</b>", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
            Paragraph("INR 75,00,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT))
        ],
        [
            Paragraph("<b>Bank Account for Payment:</b><br/>A/C: 98765432109876 | IFSC: HDFC0001234<br/>Bank: HDFC Bank, Cyber City Pune", body_style),
            Paragraph("<b>Integrated GST (IGST @ 18%):</b>", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
            Paragraph("INR 13,50,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT))
        ],
        [
            Paragraph("<font color='#059669'><b>Digitally Verified on GSTN & Invoice2Credit</b></font>", body_style),
            Paragraph("<b>Total Amount Payable:</b>", ParagraphStyle('R', parent=bold_body_style, alignment=TA_RIGHT)),
            Paragraph("<b>INR 88,50,000.00</b>", ParagraphStyle('R', parent=bold_body_style, fontSize=11, textColor=colors.HexColor('#059669'), alignment=TA_RIGHT))
        ]
    ]
    t_summary = Table(summary_data, colWidths=[290, 150, 100])
    t_summary.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (1,2), (2,2), colors.HexColor('#ECFDF5')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_summary)
    elements.append(Spacer(1, 16))

    # 6. Terms and Authorized Signatory
    terms_html = """
    <b>Terms & Conditions:</b><br/>
    1. Payment is strictly due on or before <b>30/11/2026</b> as per contract terms.<br/>
    2. Overdue payments shall attract late interest at 18% per annum as per MSMED Act 2006.<br/>
    3. Any dispute regarding this invoice must be notified in writing within 15 days.
    """

    sign_html = """
    For <b>QuantumEdge Cloud & AI Technologies Pvt. Ltd.</b><br/><br/><br/>
    <b>Authorised Signatory</b><br/>
    (Digitally signed under IT Act 2000)
    """

    bottom_data = [
        [
            Paragraph(terms_html, ParagraphStyle('T', parent=body_style, fontSize=8, leading=11)),
            Paragraph(sign_html, ParagraphStyle('S', parent=body_style, alignment=TA_RIGHT, fontSize=8, leading=11))
        ]
    ]
    t_bottom = Table(bottom_data, colWidths=[340, 200])
    t_bottom.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_bottom)

    doc.build(elements)
    print(f"Generated invoice PDF at: {output_path}")

if __name__ == "__main__":
    out_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Sample_Invoice_Infosys_QuantumEdge.pdf")
    create_invoice_pdf(out_file)
