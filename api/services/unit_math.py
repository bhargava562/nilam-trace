"""Deterministic Tamil Revenue Unit Converter & Shrinkage Delta Engine

Standards & Canonical Constants:
- 1 Acre = 100 Cents = 43,560 sq.ft
- 1 Hectare = 100 Ares = 247.105381 Cents = 107,639.104 sq.ft
- 1 Are = 2.471054 Cents = 1,076.391 sq.ft
- 1 Kuzhi = 144 sq.ft = 0.330578 Cents (144 / 435.6)
- 1 Ground = 2,400 sq.ft = 5.50964 Cents (2400 / 435.6)
- Tolerance Epsilon: max(0.25, 0.01 * deed_cents)
"""
import re
from typing import Optional, Tuple
from api.models.schemas import (
    UnitConversionResult,
    ShrinkageResult,
    DiscrepancyType,
)

# Canonical Unit Constants
SQFT_PER_CENT: float = 435.6
CENTS_PER_ACRE: float = 100.0
SQFT_PER_ACRE: float = 43560.0

CENTS_PER_HECTARE: float = 247.105381
SQFT_PER_HECTARE: float = 107639.104

CENTS_PER_ARE: float = 2.471054
SQFT_PER_ARE: float = 1076.391

SQFT_PER_KUZHI: float = 144.0
CENTS_PER_KUZHI: float = 144.0 / SQFT_PER_CENT  # ~0.3305785123966942

SQFT_PER_GROUND: float = 2400.0
CENTS_PER_GROUND: float = 2400.0 / SQFT_PER_CENT  # ~5.509641873278237


def hectare_to_cents(hectares: float, precision: int = 4) -> float:
    """Convert Hectares to Cents with standard revenue precision."""
    return round(hectares * CENTS_PER_HECTARE, precision)


def acre_to_cents(acres: float, precision: int = 4) -> float:
    """Convert Acres to Cents."""
    return round(acres * CENTS_PER_ACRE, precision)


def kuzhi_to_cents(kuzhi: float, precision: int = 2) -> float:
    """Convert Kuzhi (traditional Tamil unit) to Cents."""
    return round(kuzhi * CENTS_PER_KUZHI, precision)


def ground_to_cents(grounds: float, precision: int = 2) -> float:
    """Convert Grounds to Cents."""
    return round(grounds * CENTS_PER_GROUND, precision)


def parse_tamil_hectare_notation(notation: str) -> float:
    """
    Parse Tamil revenue hectare notation like '0.17.5' or '0.40.5' or '0-17-50'.
    In TN Revenue records (A-Register / Patta):
    Format is Hectares.Ares.SqMeters (e.g. 0.17.5 = 0 Hectares + 17.5 Ares = 0.175 Hectares).
    """
    cleaned = notation.strip().replace("-", ".").replace(" ", "")
    parts = cleaned.split(".")
    
    if len(parts) == 3:
        # e.g., "0.17.5" -> h=0, a=17, sub=5
        # 17.5 Ares = 0.175 Hectares
        try:
            h = float(parts[0])
            a = float(parts[1])
            sub = float(parts[2])
            # If sub is single digit, it's half an are or 5 sq meters or 50 sq meters:
            # 0.17.5 is 0.175 hectares
            if len(parts[2]) == 1:
                are_val = a + (sub / 10.0)
            else:
                are_val = a + (sub / 100.0)
            return h + (are_val / 100.0)
        except ValueError:
            pass
    elif len(parts) == 2:
        try:
            return float(cleaned)
        except ValueError:
            pass

    # Fallback to float match
    match = re.search(r"(\d+(\.\d+)?)", cleaned)
    if match:
        return float(match.group(1))
    return 0.0


def convert_units(value: float, unit: str) -> UnitConversionResult:
    """
    Deterministically convert any supported Tamil/Standard area unit to Cents and Sq.Ft.
    """
    unit_lower = unit.strip().lower()
    
    if "hectare" in unit_lower or "ha" in unit_lower:
        cents = hectare_to_cents(value, 4)
        sqft = round(value * SQFT_PER_HECTARE, 2)
        formula = f"{value} Ha × 247.105381 = {cents:.4f} Cents ({sqft:,.1f} sq.ft)"
    elif "acre" in unit_lower or "ac" in unit_lower:
        cents = acre_to_cents(value, 4)
        sqft = round(value * SQFT_PER_ACRE, 2)
        formula = f"{value} Acre × 100 = {cents:.2f} Cents ({sqft:,.1f} sq.ft)"
    elif "kuzhi" in unit_lower:
        cents = kuzhi_to_cents(value, 2)
        sqft = round(value * SQFT_PER_KUZHI, 2)
        formula = f"{value} Kuzhi × (144 / 435.6) = {cents:.2f} Cents ({sqft:,.1f} sq.ft)"
    elif "ground" in unit_lower:
        cents = ground_to_cents(value, 2)
        sqft = round(value * SQFT_PER_GROUND, 2)
        formula = f"{value} Ground × (2,400 / 435.6) = {cents:.2f} Cents ({sqft:,.1f} sq.ft)"
    elif "cent" in unit_lower:
        cents = round(value, 4)
        sqft = round(value * SQFT_PER_CENT, 2)
        formula = f"{value} Cents × 435.6 = {sqft:,.1f} sq.ft"
    elif "sq" in unit_lower and ("ft" in unit_lower or "feet" in unit_lower):
        cents = round(value / SQFT_PER_CENT, 4)
        sqft = round(value, 2)
        formula = f"{value} sq.ft ÷ 435.6 = {cents:.4f} Cents"
    else:
        # Default assume cents
        cents = round(value, 4)
        sqft = round(value * SQFT_PER_CENT, 2)
        formula = f"{value} Cents = {sqft:,.1f} sq.ft"

    return UnitConversionResult(
        original_value=value,
        original_unit=unit,
        cents=cents,
        sq_feet=sqft,
        breakdown_formula=formula,
    )


def calculate_shrinkage(deed_cents: float, patta_cents: float) -> ShrinkageResult:
    """
    Calculate area shrinkage between registered Deed and Patta.
    Threshold Epsilon = max(0.25, 0.01 * deed_cents).
    If patta_cents < (deed_cents - epsilon), flags AREA_SHRINKAGE_UNRECORDED_SUBDIVISION.
    Otherwise flags MATCHED.
    """
    epsilon = round(max(0.25, 0.01 * deed_cents), 4)
    delta_cents = round(patta_cents - deed_cents, 4)
    percentage_loss = round((abs(delta_cents) / deed_cents) * 100.0, 2) if deed_cents > 0 else 0.0
    
    # Check if patta is strictly less than deed minus allowed tolerance
    if patta_cents < (deed_cents - epsilon):
        is_shrinkage = True
        discrepancy_type = DiscrepancyType.AREA_SHRINKAGE_UNRECORDED_SUBDIVISION
        explanation = (
            f"Detected area shrinkage of {abs(delta_cents):.2f} Cents ({percentage_loss:.1f}% loss). "
            f"Deed has {deed_cents:.2f} Cents, but Patta only records {patta_cents:.2f} Cents. "
            f"Exceeds allowable tolerance of ±{epsilon:.2f} Cents. Likely unrecorded subdivision or road widening."
        )
        explanation_ta = (
            f"பரப்பளவு குறைவு கண்டறியப்பட்டது: {abs(delta_cents):.2f} சென்ட் ({percentage_loss:.1f}% இழப்பு). "
            f"கிரையப் பத்திரத்தில் {deed_cents:.2f} சென்ட் உள்ளது, ஆனால் பட்டாவில் {patta_cents:.2f} சென்ட் மட்டுமே உள்ளது. "
            f"அனுமதிக்கப்பட்ட விலக்கு ±{epsilon:.2f} சென்ட்டை விட அதிகம். பதிவு செய்யப்படாத உட்பிரிவு அல்லது சாலை விரிவாக்கம் காரணமாக இருக்கலாம்."
        )
    else:
        is_shrinkage = False
        discrepancy_type = DiscrepancyType.MATCHED
        explanation = (
            f"Area difference of {abs(delta_cents):.2f} Cents is within standard revenue survey "
            f"conversion tolerance (±{epsilon:.2f} Cents). Title area verified."
        )
        explanation_ta = (
            f"பரப்பளவு வித்தியாசம் {abs(delta_cents):.2f} சென்ட் அனுமதிக்கப்பட்ட வருவாய்த் துறை விலக்கு வரம்பிற்குள் (±{epsilon:.2f} சென்ட்) உள்ளது. நிலப் பரப்பளவு உறுதி செய்யப்பட்டது."
        )

    return ShrinkageResult(
        deed_cents=deed_cents,
        patta_cents=patta_cents,
        delta_cents=delta_cents,
        percentage_loss=percentage_loss,
        threshold_epsilon=epsilon,
        is_shrinkage=is_shrinkage,
        discrepancy_type=discrepancy_type,
        explanation=explanation,
        explanation_ta=explanation_ta,
    )
