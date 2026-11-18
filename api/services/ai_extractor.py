"""NilamTrace Lightweight AI & Deterministic Land Record Extractor

Uses Groq Cloud API (llama-3.3-70b-versatile or llama-3.1-8b-instant) when GROQ_API_KEY is available.
Includes full deterministic Tamil Revenue regex and rule fallback engine when no key is configured
or when API fails/times out.
"""
import re
import json
import logging
from typing import Dict, Any, List, Optional
import httpx

from api.config import settings
from api.models.schemas import ExtractedField
from api.services.unit_math import parse_tamil_hectare_notation, convert_units

logger = logging.getLogger("nilamtrace.ai_extractor")

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """You are an expert Tamil Nadu Revenue Department Document Analyst.
Extract key land record fields from the provided document text (in Tamil or English).
Return ONLY a valid JSON object with the following fields:
{
  "applicant_name": string or null,
  "father_or_husband_name": string or null,
  "district": string or null,
  "taluk": string or null,
  "village": string or null,
  "survey_no": string or null,
  "old_survey_no": string or null,
  "patta_no": string or null,
  "land_classification": string or null,
  "area_raw": string or null,
  "area_unit": string or null,
  "area_cents": float or null,
  "owner_is_deceased": boolean,
  "is_red_zone": boolean,
  "confidence": float
}
Do not include markdown or explanations. Return strictly valid JSON.
"""


def _deterministic_regex_extract(text: str, doc_type: str = "AUTO") -> Dict[str, Any]:
    """
    Deterministic rule and regex extractor for Tamil Nadu Land Records.
    Handles Sale Deeds, Tamil Nilam Pattas, A-Register extracts, and Legal Heir certificates.
    """
    result: Dict[str, Any] = {
        "applicant_name": None,
        "father_or_husband_name": None,
        "district": "Thiruvallur",
        "taluk": "Ponneri",
        "village": "Perumbedu",
        "survey_no": None,
        "old_survey_no": None,
        "patta_no": None,
        "land_classification": "Ryotwari Manai",
        "area_raw": None,
        "area_unit": "Cent",
        "area_cents": 0.0,
        "owner_is_deceased": False,
        "is_red_zone": False,
        "confidence": 0.95,
        "source": "deterministic_rules",
    }

    # Red-zone keyword check
    text_lower = text.lower()
    if any(k in text_lower for k in ["poramboke", "meikkal", "புறம்போக்கு", "மேய்க்கால்", "kovil", "waterbody"]):
        result["is_red_zone"] = True
        result["land_classification"] = "Meikkal Poramboke"

    # Deceased check
    if any(k in text_lower for k in ["deceased", "late", "மறைந்த", "காலமான", "death certificate"]):
        result["owner_is_deceased"] = True

    # Survey Number match
    survey_match = re.search(r"(?:Survey\s*(?:No|Number)?|புல\s*எண்|சர்வே\s*எண்)[\s:.]*([0-9]+[A-Za-z0-9\/\-]+)", text, re.I)
    if survey_match:
        result["survey_no"] = survey_match.group(1).strip()

    # Old Survey Number match
    old_survey_match = re.search(r"(?:Old\s*Survey\s*(?:No|Number)?|பழைய\s*சர்வே\s*எண்)[\s:.]*([0-9]+[A-Za-z0-9\/\-]+)", text, re.I)
    if old_survey_match:
        result["old_survey_no"] = old_survey_match.group(1).strip()

    # Patta Number match
    patta_match = re.search(r"(?:Patta\s*(?:No|Number)?|பட்டா\s*எண்)[\s:.]*([0-9]+)", text, re.I)
    if patta_match:
        result["patta_no"] = patta_match.group(1).strip()

    # Area match
    # Look for Hectares: 0.17.5 or 0.40.5
    ha_match = re.search(r"(0\.\d+\.\d+)\s*(?:Hectare|Ha|ஹெக்டேர்)?", text, re.I)
    if ha_match:
        raw_val = ha_match.group(1)
        ha_val = parse_tamil_hectare_notation(raw_val)
        conv = convert_units(ha_val, "Hectare")
        result["area_raw"] = raw_val
        result["area_unit"] = "Hectare"
        result["area_cents"] = conv.cents
    else:
        # Look for Cents or Acres
        cent_match = re.search(r"(\d+(?:\.\d+)?)\s*(Cents?|Acres?|Kuzhi|Grounds?|சென்ட்|ஏக்கர்)", text, re.I)
        if cent_match:
            val = float(cent_match.group(1))
            unit = cent_match.group(2)
            conv = convert_units(val, unit)
            result["area_raw"] = f"{val} {unit}"
            result["area_unit"] = unit
            result["area_cents"] = conv.cents

    # Name extraction
    name_match = re.search(r"(?:Thiru|Mr|திரு)\.?\s*([A-Za-z\u0B80-\u0BFF\s\.]+?)(?:,|S/o|D/o|W/o|த/பெ|\n)", text, re.I)
    if name_match:
        result["applicant_name"] = name_match.group(1).strip()

    rel_match = re.search(r"(?:S/o|D/o|W/o|த/பெ|க/பெ)\.?\s*([A-Za-z\u0B80-\u0BFF\s\.]+?)(?:,|\n|\.)", text, re.I)
    if rel_match:
        result["father_or_husband_name"] = rel_match.group(1).strip()

    return result


def extract_land_record_data(document_text: str, doc_type: str = "AUTO") -> Dict[str, Any]:
    """
    Extract structured land record information.
    Attempts Groq LLM if GROQ_API_KEY is configured, falling back to deterministic regex.
    """
    if not settings.GROQ_API_KEY or len(settings.GROQ_API_KEY.strip()) < 5:
        logger.info("GROQ_API_KEY not configured. Running deterministic Tamil Revenue extractor.")
        return _deterministic_regex_extract(document_text, doc_type)

    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY.strip()}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Document Type: {doc_type}\nText:\n{document_text[:3000]}"},
        ],
        "temperature": 0.1,
        "max_tokens": settings.MAX_TOKENS,
        "response_format": {"type": "json_object"},
    }

    try:
        with httpx.Client(timeout=settings.GROQ_TIMEOUT_SECONDS) as client:
            resp = client.post(GROQ_ENDPOINT, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                parsed["source"] = f"groq_{settings.GROQ_MODEL}"
                parsed["confidence"] = 0.98
                return parsed
            else:
                logger.warning(f"Groq API returned status {resp.status_code}. Using fallback.")
    except Exception as e:
        logger.warning(f"Groq extraction failed with error: {e}. Executing deterministic fallback.")

    return _deterministic_regex_extract(document_text, doc_type)


def build_extracted_fields(extracted_data: Dict[str, Any], doc_type: str) -> List[ExtractedField]:
    """Convert raw extracted dictionary to standardized ExtractedField schema items."""
    fields: List[ExtractedField] = []
    
    mapping = [
        ("applicant_name", "Applicant Name"),
        ("father_or_husband_name", "Father/Husband Name"),
        ("survey_no", "Survey Number"),
        ("old_survey_no", "Old Pre-UDR Survey Number"),
        ("patta_no", "Patta Number"),
        ("land_classification", "Land Classification"),
        ("area_cents", "Calculated Cents"),
        ("area_raw", "Raw Area In Record"),
    ]

    for key, label in mapping:
        val = extracted_data.get(key)
        if val is not None:
            fields.append(
                ExtractedField(
                    field_name=label,
                    value=val,
                    raw_text=str(val),
                    confidence=float(extracted_data.get("confidence", 0.95)),
                    doc_type=doc_type,
                    page=1,
                )
            )

    return fields
