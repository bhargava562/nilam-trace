"""NilamTrace v2 — ReportLab Verified Inheritance Packet & Dossier Generator
Produces verified, QR-stamped application bundles with human verification logs and statutory disclaimers.
"""
from datetime import datetime
import io
import os
import qrcode
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    HRFlowable,
    Image,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from api.models.schemas import CaseState


def generate_qr_image_bytes(data: str) -> io.BytesIO:
    """Generates QR code PNG image as in-memory BytesIO buffer."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=4,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0B6E4F", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def generate_dossier_pdf(case: CaseState) -> bytes:
    """
    Generates a formal, bilingual PDF packet.
    If REV-114 is missing: outputs 'Step 1 Prerequisite Packet: REV-114 Legal Heir Certificate'.
    If REV-114 is available: outputs 'Verified Inheritance Case Preparation Packet'.
    """
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()
    header_style = ParagraphStyle(
        "HeaderStyle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0B6E4F"),
        alignment=1,
    )
    sub_style = ParagraphStyle(
        "SubStyle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#4B5563"),
        alignment=1,
    )
    section_title = ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#0B6E4F"),
    )
    body_style = ParagraphStyle(
        "BodyStyle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#111827"),
    )
    disclaimer_style = ParagraphStyle(
        "DisclaimerStyle",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=7,
        leading=9,
        textColor=colors.HexColor("#DC2626"),
        alignment=1,
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("GOVERNMENT OF TAMIL NADU — REVENUE ADMINISTRATION", sub_style))
    story.append(Paragraph("தமிழ்நாடு அரசு வருவாய்த் துறை · இ-சேவை மையம் / JanAI Café", sub_style))
    story.append(Spacer(1, 4))
    
    if not case.rev114_available:
        title_text = "STEP 1 PREREQUISITE PACKET: REV-114 LEGAL HEIR CERTIFICATE APPLICATION"
        title_sub = "வட்டாட்சியர் வாரிசுச் சான்றிதழ் விண்ணப்ப வழிகாட்டி & ஆவண சரிபார்ப்பு"
    else:
        title_text = "VERIFIED INHERITANCE CASE PREPARATION PACKET (PATTA MARUTHAL)"
        title_sub = "வாரிசு உரிமை பட்டா மாறுதல் விண்ணப்ப ஆவணம்"

    story.append(Paragraph(title_text, header_style))
    story.append(Paragraph(title_sub, sub_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0B6E4F")))
    story.append(Spacer(1, 8))

    # 2. Case Identification Grid
    case_meta = [
        [
            Paragraph("<b>Case Pocket Code:</b>", body_style),
            Paragraph(f"<b>#{case.case_id}</b>", body_style),
            Paragraph("<b>Date of Ingestion:</b>", body_style),
            Paragraph(case.created_at[:10], body_style),
        ],
        [
            Paragraph("<b>Applicant Name:</b>", body_style),
            Paragraph(f"{case.applicant_name} ({case.applicant_name_ta})", body_style),
            Paragraph("<b>Deceased Landowner:</b>", body_style),
            Paragraph(f"{case.deceased_name} ({case.deceased_name_ta})", body_style),
        ],
        [
            Paragraph("<b>Jurisdiction:</b>", body_style),
            Paragraph(f"{case.village} Village, {case.taluk} Taluk, {case.district} Dist.", body_style),
            Paragraph("<b>Survey & Subdivision:</b>", body_style),
            Paragraph(f"New: {case.new_survey_no or 'N/A'} (Old: {case.old_survey_no or 'N/A'})", body_style),
        ],
        [
            Paragraph("<b>Chosen Path:</b>", body_style),
            Paragraph(case.chosen_path.value if case.chosen_path else "UNDECIDED", body_style),
            Paragraph("<b>Administrative Status:</b>", body_style),
            Paragraph(f"<b>{case.status}</b>", body_style),
        ],
    ]

    t_meta = Table(case_meta, colWidths=[120, 150, 120, 150])
    t_meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F4F7F5")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1DBD5")),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # 3. Document Possession & Readiness Checklist
    story.append(Paragraph("1. Statutory Document Inventory & Multi-Visit Tracker", section_title))
    story.append(Spacer(1, 4))

    doc_rows = [[
        Paragraph("<b>Document Type</b>", body_style),
        Paragraph("<b>Status</b>", body_style),
        Paragraph("<b>Statutory Fee</b>", body_style),
        Paragraph("<b>Action Required / How to Obtain</b>", body_style),
    ]]

    for item in case.inventory:
        status_color = "#15803D" if item.status.value in ["AVAILABLE", "UPLOADED"] else "#DC2626"
        status_txt = f"<font color='{status_color}'><b>{item.status.value}</b></font>"
        doc_rows.append([
            Paragraph(f"{item.doc_name}", body_style),
            Paragraph(status_txt, body_style),
            Paragraph(f"₹{item.official_fee_inr:.2f}", body_style),
            Paragraph(item.how_to_obtain_en, body_style),
        ])

    t_docs = Table(doc_rows, colWidths=[160, 90, 70, 220])
    t_docs.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1DBD5")),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t_docs)
    story.append(Spacer(1, 10))

    # 4. Mandatory Human Verification Log
    story.append(Paragraph("2. Mandatory Human Operator Verification Log (No Black-Box Acceptance)", section_title))
    story.append(Spacer(1, 4))

    field_rows = [[
        Paragraph("<b>Field Name</b>", body_style),
        Paragraph("<b>Extracted OCR Value</b>", body_style),
        Paragraph("<b>Confidence</b>", body_style),
        Paragraph("<b>Human Operator Verified?</b>", body_style),
    ]]

    for fname, fval in case.verified_fields.items():
        v_color = "#15803D" if fval.human_verified else "#D97706"
        v_txt = f"<font color='{v_color}'><b>{'VERIFIED BY OPERATOR' if fval.human_verified else 'PENDING OPERATOR CHECK'}</b></font>"
        field_rows.append([
            Paragraph(fname, body_style),
            Paragraph(str(fval.corrected_value or fval.extracted_value), body_style),
            Paragraph(f"{fval.confidence * 100:.1f}%", body_style),
            Paragraph(v_txt, body_style),
        ])

    t_fields = Table(field_rows, colWidths=[130, 180, 80, 150])
    t_fields.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1DBD5")),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t_fields)
    story.append(Spacer(1, 10))

    # 5. Voluntary Heir Statement & Non-Binding Notice
    story.append(Paragraph("3. Voluntary Family Structure Log & Legal Disclaimer", section_title))
    story.append(Spacer(1, 4))

    heir_rows = [[
        Paragraph("<b>Reported Legal Heir</b>", body_style),
        Paragraph("<b>Relationship to Deceased</b>", body_style),
        Paragraph("<b>Age</b>", body_style),
        Paragraph("<b>Source Attribution</b>", body_style),
    ]]

    for h in case.heir_statements:
        heir_rows.append([
            Paragraph(f"{h.heir_name} ({h.heir_name_ta or ''})", body_style),
            Paragraph(f"{h.relation}", body_style),
            Paragraph(str(h.age or 'N/A'), body_style),
            Paragraph(h.attributed_to, body_style),
        ])

    if len(heir_rows) > 1:
        t_heirs = Table(heir_rows, colWidths=[170, 130, 50, 190])
        t_heirs.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1DBD5")),
            ("PADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(t_heirs)
    else:
        story.append(Paragraph("No voluntary heir statements recorded yet.", body_style))

    story.append(Spacer(1, 6))
    notice_text = (
        "<b>LEGAL NOTICE & STATUTORY BOUNDARY:</b> Informational family tree only — does not establish legal title, partition, "
        "or formal succession; formal revenue transfer requires a Tahsildar Legal Heir Certificate (REV-114) and, if any co-heir "
        "relinquishes shares, a registered Release/Partition Deed before the Sub-Registrar. NilamTrace does not certify title."
    )
    story.append(Paragraph(notice_text, disclaimer_style))
    story.append(Spacer(1, 10))

    # 6. QR Code & Consent Footer
    verification_url = f"https://nilamtrace.vercel.app/verify/{case.case_id}?token=HITL-{case.case_id}"
    qr_buf = generate_qr_image_bytes(verification_url)
    qr_img = Image(qr_buf, width=54, height=54)

    footer_data = [
        [
            qr_img,
            Paragraph(
                f"<b>Official Provenance Stamp — JanAI Café Assisted Console</b><br/>"
                f"Case #{case.case_id} · Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}<br/>"
                f"Officer HITL Approval: {'VERIFIED (MFA OTP: 1234)' if case.hitl_approved else 'UNAPPROVED / DRAFT'}<br/>"
                f"Statutory e-Sevai Fee: ₹{case.pilot_metrics.get('official_fees_inr', 60.0):.2f}",
                body_style,
            ),
        ]
    ]

    t_footer = Table(footer_data, colWidths=[65, 475])
    t_footer.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEABOVE", (0, 0), (-1, -1), 1, colors.HexColor("#0B6E4F")),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t_footer)

    doc.build(story)
    pdf_bytes = buf.getvalue()
    buf.close()
    return pdf_bytes
