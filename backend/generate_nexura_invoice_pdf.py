import os
import shutil
import hashlib
import random
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
            Paragraph("<b>Ack No:</b> 1120269984102<br/><b>Ack Date:</b> 2026-08-07 14:20:15", ParagraphStyle('Ack', parent=styles['Normal'], fontSize=7.5, leading=10, textColor=colors.HexColor('#475569'), alignment=TA_RIGHT))
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
    # BUYER: Infosys Limited (Same)
    # SELLER: Nexura Robotics & Autonomous Systems Pvt. Ltd. (New)
    seller_html = """
    <b>Sold by / Vendor:</b><br/>
    <b>Nexura Robotics & Autonomous Systems Pvt. Ltd.</b><br/>
    Module 104, 1st Floor, TIDEL Park, Rajiv Gandhi Salai<br/>
    Taramani, Chennai, Tamil Nadu 600113<br/>
    <b>GSTIN:</b> 33AAACN8145P1Z8<br/>
    <b>PAN:</b> AAACN8145P | <b>State:</b> Tamil Nadu (33)
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
    <b>Invoice No:</b> NEX-2026-AUTO-518<br/>
    <b>Date of Invoice:</b> 07/08/2026<br/>
    <b>Payment Due Date:</b> 06/10/2026<br/>
    <b>Payment Terms:</b> Net 60 Days<br/>
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
            Paragraph("<b>Enterprise Autonomous Guided Vehicles (AGV) Fleet</b><br/><font size='7.5' color='#64748B'>Nexura AMR-1000 Heavy Payload Warehouse Logistics Units</font>", body_style),
            Paragraph("842890", body_style),
            Paragraph("3 Nos", body_style),
            Paragraph("INR 18,50,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
            Paragraph("INR 55,50,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
        ],
        [
            Paragraph("2", body_style),
            Paragraph("<b>Industrial LiDAR & SLAM Fleet Orchestration Software</b><br/><font size='7.5' color='#64748B'>Nexura FleetMaster Multi-Robot Orchestration License</font>", body_style),
            Paragraph("998313", body_style),
            Paragraph("1 Lic", body_style),
            Paragraph("INR 12,00,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
            Paragraph("INR 12,00,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
        ],
        [
            Paragraph("3", body_style),
            Paragraph("<b>Telemetry Calibration & 24x7 Mission Critical Support SLA</b><br/><font size='7.5' color='#64748B'>Annual on-site maintenance, optical sensors recalibration & SLA</font>", body_style),
            Paragraph("998314", body_style),
            Paragraph("1 Qtr", body_style),
            Paragraph("INR 4,50,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
            Paragraph("INR 4,50,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
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
            Paragraph("<b>Amount in Words:</b><br/>Rupees Eighty-Four Lakh Ninety-Six Thousand Only", body_style),
            Paragraph("<b>Subtotal / Taxable Value:</b>", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
            Paragraph("INR 72,00,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT))
        ],
        [
            Paragraph("<b>Bank Account for Settlement:</b><br/>A/C: 004705009182 | IFSC: ICIC0000047<br/>Bank: ICICI Bank, TIDEL Park Chennai", body_style),
            Paragraph("<b>Integrated GST (IGST @ 18%):</b>", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT)),
            Paragraph("INR 12,96,000.00", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT))
        ],
        [
            Paragraph("<font color='#059669'><b>Digitally Verified on GSTN & Invoice2Credit</b></font>", body_style),
            Paragraph("<b>Total Amount Payable:</b>", ParagraphStyle('R', parent=bold_body_style, alignment=TA_RIGHT)),
            Paragraph("<b>INR 84,96,000.00</b>", ParagraphStyle('R', parent=bold_body_style, fontSize=11, textColor=colors.HexColor('#059669'), alignment=TA_RIGHT))
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
    1. Payment is strictly due on or before <b>06/10/2026</b> as per contract terms.<br/>
    2. Overdue payments shall attract late interest at 18% per annum as per MSMED Act 2006.<br/>
    3. Any dispute regarding this invoice must be notified in writing within 15 days.
    """

    sign_html = """
    For <b>Nexura Robotics & Autonomous Systems Pvt. Ltd.</b><br/><br/><br/>
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
    workspace_pdf = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Sample_Invoice_Infosys_NexuraRobotics.pdf")
    create_invoice_pdf(workspace_pdf)
    
    desktop_path = "C:/Users/saad2/Desktop/Sample_Invoice_Infosys_NexuraRobotics.pdf"
    try:
        shutil.copy(workspace_pdf, desktop_path)
        print(f"Copied to Desktop successfully: {desktop_path}")
    except Exception as e:
        print(f"Could not copy to Desktop: {e}")
