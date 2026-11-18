"""Test Suite 1: Tamil Revenue Unit Conversion & Shrinkage Delta Engine

Covers:
1. test_hectare_to_cents_exact: 0.17.5 Hectares (0.175 Ha) converts to 43.2434 Cents
2. test_shrinkage_detection: 48.0 Cents (Deed) vs 43.24 Cents (Patta) flags -4.76 Cents (AREA_SHRINKAGE_UNRECORDED_SUBDIVISION)
3. test_udr_rounding_tolerance: 1.00 Acre (100.0 Cents) vs 0.40.5 Hectares (100.08 Cents) passes as MATCHED within tolerance epsilon
4. test_kuzhi_and_ground_conversion: 300 Kuzhi = 99.17 Cents and 2 Grounds = 11.02 Cents
"""
import pytest
from api.models.schemas import DiscrepancyType
from api.services.unit_math import (
    hectare_to_cents,
    acre_to_cents,
    kuzhi_to_cents,
    ground_to_cents,
    parse_tamil_hectare_notation,
    convert_units,
    calculate_shrinkage,
    CENTS_PER_HECTARE,
)


def test_hectare_to_cents_exact():
    """
    Test 1: 0.17.5 Hectares (0.175 Ha) converts to 43.2434 Cents (exact revenue math).
    Canonical ratio: 1 Hectare = 247.105381 Cents.
    0.175 * 247.105381 = 43.243441675 Cents -> rounded to 4 decimals = 43.2434 Cents.
    """
    # Test parsing Tamil revenue notation '0.17.5'
    ha_val = parse_tamil_hectare_notation("0.17.5")
    assert ha_val == 0.175, f"Expected 0.175 Ha from '0.17.5', got {ha_val}"

    # Test exact conversion
    cents = hectare_to_cents(ha_val, precision=4)
    assert cents == 43.2434, f"Expected 43.2434 Cents, got {cents}"
    assert abs(cents - 43.2434) < 1e-4

    # Test via convert_units helper
    result = convert_units(ha_val, "hectares")
    assert result.cents == 43.2434
    assert result.original_value == 0.175
    assert "Ha" in result.breakdown_formula or "247.105381" in result.breakdown_formula


def test_shrinkage_detection():
    """
    Test 2: 48.0 Cents (Deed) vs 43.24 Cents (Patta) flags -4.76 Cents
    and categorizes as AREA_SHRINKAGE_UNRECORDED_SUBDIVISION.
    """
    deed_cents = 48.0
    patta_cents = 43.24

    res = calculate_shrinkage(deed_cents, patta_cents)

    # Check delta calculation: 43.24 - 48.0 = -4.76 Cents
    assert res.delta_cents == -4.76, f"Expected delta -4.76 Cents, got {res.delta_cents}"
    assert res.is_shrinkage is True
    assert res.discrepancy_type == DiscrepancyType.AREA_SHRINKAGE_UNRECORDED_SUBDIVISION
    assert res.percentage_loss == pytest.approx(9.92, rel=1e-2)
    assert res.threshold_epsilon == pytest.approx(0.48, rel=1e-2)
    assert "4.76" in res.explanation
    assert res.explanation_ta is not None


def test_udr_rounding_tolerance():
    """
    Test 3: 1.00 Acre (100.0 Cents) vs 0.40.5 Hectares (100.08 Cents) passes as MATCHED
    within tolerance epsilon = max(0.25, 0.01 * deed_cents).
    For 100.0 Cents, epsilon = max(0.25, 1.0) = 1.0 Cent.
    Difference is +0.08 Cents, well within ±1.0 Cent.
    """
    # Parse 0.40.5 Hectares -> 0.405 Ha
    ha_val = parse_tamil_hectare_notation("0.40.5")
    assert ha_val == 0.405

    # 0.405 Ha in cents = 0.405 * 247.105381 = 100.077679 -> ~100.08 Cents
    patta_cents = round(ha_val * CENTS_PER_HECTARE, 2)
    assert patta_cents == 100.08

    deed_cents = 100.0  # 1.00 Acre = 100.0 Cents
    res = calculate_shrinkage(deed_cents, patta_cents)

    # Epsilon for 100 Cents is max(0.25, 0.01 * 100) = 1.0 Cent
    assert res.threshold_epsilon == 1.0
    assert res.is_shrinkage is False
    assert res.discrepancy_type == DiscrepancyType.MATCHED
    assert abs(res.delta_cents) <= res.threshold_epsilon


def test_kuzhi_and_ground_conversion():
    """
    Test 4: 300 Kuzhi = 99.17 Cents and 2 Grounds = 11.02 Cents.
    Canonical math:
    - 1 Kuzhi = 144 sq.ft = 144 / 435.6 = 0.3305785 Cents
      300 Kuzhi = 300 * 0.3305785 = 99.17355 -> 99.17 Cents
    - 1 Ground = 2,400 sq.ft = 2400 / 435.6 = 5.5096418 Cents
      2 Grounds = 2 * 5.5096418 = 11.01928 -> 11.02 Cents
    """
    # 300 Kuzhi conversion
    kuzhi_cents = kuzhi_to_cents(300)
    assert kuzhi_cents == 99.17, f"Expected 99.17 Cents, got {kuzhi_cents}"

    res_kuzhi = convert_units(300, "kuzhi")
    assert res_kuzhi.cents == 99.17
    assert res_kuzhi.sq_feet == 43200.0  # 300 * 144

    # 2 Grounds conversion
    ground_cents = ground_to_cents(2)
    assert ground_cents == 11.02, f"Expected 11.02 Cents, got {ground_cents}"

    res_ground = convert_units(2, "ground")
    assert res_ground.cents == 11.02
    assert res_ground.sq_feet == 4800.0  # 2 * 2400
