"""Sample PDF Generator for NilamTrace Canonical Test Cases

Generates realistic watermarked Tamil Nadu land record PDFs:
- Case #4821: 1994 Sale Deed (48.0 Cents, Old S.No 45/2)
- Case #4821: 2024 Computerized Patta (0.17.5 Ha = 43.24 Cents, New S.No 114/2B)
- Case #9012: Village A-Register (Meikkal Poramboke S.No 88/1)
"""
import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

SAMPLE_DIR = os.path.dirname(os.path.abspath(__file__))


class WatermarkedCanvas(canvas.Canvas):
    """Canvas that prints a light grey diagonal watermark across every page."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.watermark_text = "NILAMTRACE DEMO RECORD • நில உரிமை சோதனை"

    def set_watermark(self, text: str):
        self.watermark_text = text

    def draw_watermark(self):
        self.saveState()
        self.setFont("Helvetica-Bold", 42)
        self.setFillColor(colors.HexColor("#D1D5DB"), alpha=0.35)
        self.translate(300, 420)
        self.rotate(45)
        self.drawCentredString(0, 0, self.watermark_text)
        self.restoreState()

    def showPage(self):
        self.draw_watermark()
        super().showPage()


def create_case_4821_sale_deed() -> str:
    """Generate 1994 Sale Deed (48.0 Cents, Old S.No 45/2)."""
    filepath = os.path.join(SAMPLE_DIR, "case_4821_sale_deed_1994.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=A4, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()

    header_style = ParagraphStyle("H1", fontName="Helvetica-Bold", fontSize=14, leading=18, alignment=1, textColor=colors.HexColor("#1E3A8A"))
    sub_style = ParagraphStyle("H2", fontName="Helvetica", fontSize=10, leading=14, alignment=1)
    body_style = ParagraphStyle("Body", fontName="Helvetica", fontSize=9, leading=13)

    story = [
        Paragraph("<b>REGISTRATION DEPARTMENT, GOVERNMENT OF TAMIL NADU</b>", header_style),
        Paragraph("Sub-Registrar Office, Ponneri • Thiruvallur District", sub_style),
        Spacer(1, 10),
        Paragraph("<b>REGISTERED SALE DEED (கிரையப் பத்திரம்)</b>", header_style),
        Paragraph("Document No: 142 of 1994 • Book 1, Volume 312, Pages 104-108", sub_style),
        Spacer(1, 15),
        Paragraph(
            "This Absolute Deed of Sale executed on 18th day of July 1994 between Vendor Thiru S. Venkatachalam "
            "and Purchaser <b>Thiru K. Subramanian S/o Raman</b>, residing at Perumbedu Village, Ponneri Taluk.",
            body_style,
        ),
        Spacer(1, 10),
        Paragraph("<b>SCHEDULE OF PROPERTY / சொத்து விவரம்:</b>", ParagraphStyle("B", fontName="Helvetica-Bold", fontSize=10)),
        Spacer(1, 4),
    ]

    sched_data = [
        ["Registration District", "Thiruvallur"],
        ["Sub-Registration District", "Ponneri"],
        ["Revenue Village", "Perumbedu"],
        ["Old Survey Number", "45/2 (புல எண் 45/2)"],
        ["Classification", "Ryotwari Dry/Manai"],
        ["Extent Conveyed", "<b>48.00 Cents</b> (Forty-Eight Cents)"],
        ["Boundaries", "North: Murugesan land, South: Village Cart Track, East: Canal, West: Raman Land"],
    ]
    t = Table([[Paragraph(c[0], body_style), Paragraph(c[1], body_style)] for c in sched_data], colWidths=[160, 340])
    t.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F1F5F9")),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(t)
    story.append(Spacer(1, 20))
    story.append(Paragraph("Duly registered and stamp duty paid. Signature of Sub-Registrar, Ponneri.", body_style))

    doc.build(story, canvasmaker=WatermarkedCanvas)
    return filepath


def create_case_4821_patta() -> str:
    """Generate 2024 Computerized Tamil Nilam Patta (0.17.5 Ha = 43.24 Cents, New S.No 114/2B)."""
    filepath = os.path.join(SAMPLE_DIR, "case_4821_patta_2024.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=A4, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()

    header_style = ParagraphStyle("H1", fontName="Helvetica-Bold", fontSize=14, leading=18, alignment=1, textColor=colors.HexColor("#0B6E4F"))
    sub_style = ParagraphStyle("H2", fontName="Helvetica", fontSize=10, leading=14, alignment=1)
    body_style = ParagraphStyle("Body", fontName="Helvetica", fontSize=9, leading=13)

    story = [
        Paragraph("<b>TAMIL NADU REVENUE DEPARTMENT • தமிழ் நிலம் இணைய வழி பட்டா</b>", header_style),
        Paragraph("Form No. 1042 / உ படிவம் • Computerized Record of Rights", sub_style),
        Spacer(1, 15),
        Paragraph("<b>PATTA EXTRACT / பட்டா விபரம் (Patta No: 1042)</b>", header_style),
        Spacer(1, 10),
    ]

    patta_data = [
        ["District / மாவட்டம்", "Thiruvallur / திருவள்ளூர்"],
        ["Taluk / வட்டம்", "Ponneri / பொன்னேரி"],
        ["Village / கிராமம்", "Perumbedu (Village Code: 014)"],
        ["Pattadhar Name", "<b>K. Subramanian S/o Raman</b> (கே. சுப்பிரமணியன்)"],
        ["New Survey No / உட்பிரிவு", "<b>114/2B</b> (பழைய எண் 45/2)"],
        ["Classification / நில வகைப்பாடு", "Ryotwari Manai / நஞ்சை ரயத்துவாரி"],
        ["Extent in Hectares", "<b>0.17.5 Hectares</b> (17.5 Ares = 43.24 Cents)"],
        ["Tax / தீர்வை", "Rs. 4.25"],
    ]
    t = Table([[Paragraph(c[0], body_style), Paragraph(c[1], body_style)] for c in patta_data], colWidths=[180, 320])
    t.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#A7F3D0")),
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#ECFDF5")),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(t)
    story.append(Spacer(1, 20))
    story.append(Paragraph("This is a digitally verified copy generated by Tamil Nilam e-Services.", body_style))

    doc.build(story, canvasmaker=WatermarkedCanvas)
    return filepath


def create_case_9012_aregister() -> str:
    """Generate Case #9012 Village A-Register (Meikkal Poramboke S.No 88/1)."""
    filepath = os.path.join(SAMPLE_DIR, "case_9012_aregister_meikkal.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=A4, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()

    header_style = ParagraphStyle("H1", fontName="Helvetica-Bold", fontSize=14, leading=18, alignment=1, textColor=colors.HexColor("#DC2626"))
    sub_style = ParagraphStyle("H2", fontName="Helvetica", fontSize=10, leading=14, alignment=1)
    body_style = ParagraphStyle("Body", fontName="Helvetica", fontSize=9, leading=13)

    story = [
        Paragraph("<b>TAMIL NADU REVENUE DEPARTMENT • 'A' REGISTER EXTRACT</b>", header_style),
        Paragraph("Settlement Officer Record • Chengalpattu District • Thiruporur Taluk", sub_style),
        Spacer(1, 15),
        Paragraph("<b>STATUTORY PROHIBITED REGISTER / நில பதிவேடு</b>", header_style),
        Spacer(1, 10),
    ]

    reg_data = [
        ["Village", "Illalur (இல்லலூர்)"],
        ["Survey & Subdivision No", "<b>88/1</b>"],
        ["Government / Inam", "Government (அரசு)"],
        ["Detailed Classification", "<b>MEIKKAL PORAMBOKE (மேய்க்கால் புறம்போக்கு)</b>"],
        ["Total Extent", "2.50 Acres (1.01.0 Hectares)"],
        ["Remarks & Restrictions", "<b>COMMUNAL GRAZING GROUND - PRIVATE ENCROACHMENT VOID</b>"],
        ["Legal Reference", "TN Land Encroachment Act 1905, Sec 2 & HC WP 10078/2021"],
    ]
    t = Table([[Paragraph(c[0], body_style), Paragraph(c[1], body_style)] for c in reg_data], colWidths=[180, 320])
    t.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#FECACA")),
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#FEF2F2")),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(t)
    story.append(Spacer(1, 20))
    story.append(Paragraph("WARNING: Prohibited Poramboke Land. Alienation or bank mortgage is illegal.", body_style))

    doc.build(story, canvasmaker=WatermarkedCanvas)
    return filepath


def generate_all_samples():
    """Build all sample PDFs."""
    p1 = create_case_4821_sale_deed()
    p2 = create_case_4821_patta()
    p3 = create_case_9012_aregister()
    print(f"Generated samples:\n- {p1}\n- {p2}\n- {p3}")


if __name__ == "__main__":
    generate_all_samples()
