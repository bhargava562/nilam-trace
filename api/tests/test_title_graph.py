"""Test Suite 2: NetworkX Title Graph & Red-Zone Gate Verification

Covers:
1. test_deceased_pattadhar_blocks_direct_loan: Detects deceased owner and activates MISSING_INHERITANCE_MUTATION
2. test_poramboke_red_zone_halt: Case #9012 (Meikkal Poramboke) triggers CRITICAL_RED_ZONE_BLOCK
3. test_old_to_new_survey_correlation: Links Old Survey 45/2 to New Survey 114/2B as RESOLVED_UDR_SURVEY_LINK
4. test_homonym_separation: Ensures "Subramanian S/o Raman" and "Subramanian S/o Krishnan" remain distinct graph nodes
"""
import pytest
from api.models.schemas import (
    PersonNode,
    CaseState,
    DiscrepancyType,
    DiscrepancySeverity,
    FamilyShare,
)
from api.services.title_graph import (
    TitleGraphEngine,
    normalize_person_key,
    run_full_title_analysis,
)


def test_deceased_pattadhar_blocks_direct_loan():
    """
    Test 1: Detects deceased owner and activates MISSING_INHERITANCE_MUTATION
    requiring speakerphone heir verification / co-parcener consent before loan approval.
    """
    engine = TitleGraphEngine()

    deceased_father = PersonNode(
        name="K. Subramanian",
        father_or_husband_name="Raman",
        relationship="S/o",
        is_deceased=True,
        legal_heir_status="PATTADHAR",
    )
    applicant = PersonNode(
        name="S. Murugan",
        father_or_husband_name="K. Subramanian",
        relationship="S/o",
        is_deceased=False,
        legal_heir_status="LEGAL_HEIR",
        share_percentage=50.0,
    )
    family_shares = [
        FamilyShare(
            person_id="P1",
            name="S. Murugan",
            name_ta="சு. முருகன்",
            relationship="Son",
            share_percentage=50.0,
            share_cents=21.62,
            consent_status="CONSENTED",
        ),
        FamilyShare(
            person_id="P2",
            name="S. Selvi",
            name_ta="சு. செல்வி",
            relationship="Daughter",
            share_percentage=50.0,
            share_cents=21.62,
            consent_status="PENDING",
        ),
    ]

    disc = engine.check_inheritance_mutation(
        applicant=applicant,
        prior_pattadhar=deceased_father,
        family_shares=family_shares,
    )

    assert disc is not None
    assert disc.type == DiscrepancyType.MISSING_INHERITANCE_MUTATION
    assert disc.resolved is False
    assert "deceased" in disc.description.lower()
    assert "Murugan" in disc.description
    assert "Selvi" in disc.description
    assert disc.action_required is not None


def test_poramboke_red_zone_halt():
    """
    Test 2: Meikkal Poramboke (Case #9012) triggers CRITICAL_RED_ZONE_BLOCK
    and immediately halts loan processing.
    """
    engine = TitleGraphEngine()

    # Direct Red-Zone check
    disc = engine.check_red_zone("Meikkal Poramboke (Government Grazing Ground)")
    assert disc is not None
    assert disc.type == DiscrepancyType.CRITICAL_RED_ZONE_BLOCK
    assert disc.severity == DiscrepancySeverity.CRITICAL
    assert disc.resolved is False
    assert "HALT APPLICATION" in disc.action_required

    # Also test case state analysis for Case #9012 representation
    case_9012 = CaseState(
        case_id="9012",
        case_title="Guduvancherry Red-Zone Poramboke Encroachment Trap",
        case_title_ta="கூடுவாஞ்சேரி மேய்க்கால் புறம்போக்கு நில அபாயம்",
        applicant_name="P. Ramesh",
        applicant_name_ta="பி. ரமேஷ்",
        phone="+91 94441 56789",
        district="Chengalpattu",
        taluk="Vandalur",
        village="Guduvancherry",
        old_survey_no="12",
        new_survey_no="88/1",
        deed_area_raw="2.00 Acres",
        deed_area_cents=200.0,
        patta_area_raw="2.00 Acres",
        patta_area_cents=200.0,
        area_delta_cents=0.0,
        land_classification="Meikkal Poramboke (Government Grazing Land)",
        created_at="2026-11-18T10:00:00Z",
        updated_at="2026-11-18T10:00:00Z",
    )

    analyzed = run_full_title_analysis(case_9012)
    assert analyzed.is_red_zone is True
    assert analyzed.status == "REJECTED_RED_ZONE"
    assert analyzed.loan_eligibility == "CRITICAL_RED_ZONE_BLOCKED"
    assert any(d.type == DiscrepancyType.CRITICAL_RED_ZONE_BLOCK for d in analyzed.discrepancies)


def test_old_to_new_survey_correlation():
    """
    Test 3: Links Old Survey 45/2 to New Survey 114/2B as RESOLVED_UDR_SURVEY_LINK
    verifying unbroken title continuity through the 1984 UDR scheme.
    """
    engine = TitleGraphEngine()

    disc = engine.reconcile_udr_surveys(old_survey="45/2", new_survey="114/2B", village="Perumbedu")

    assert disc is not None
    assert disc.type == DiscrepancyType.RESOLVED_UDR_SURVEY_LINK
    assert disc.resolved is True
    assert disc.severity == DiscrepancySeverity.RESOLVED
    assert disc.deed_value == "45/2"
    assert disc.patta_value == "114/2B"
    assert "UDR" in disc.title


def test_homonym_separation():
    """
    Test 4: Ensures 'Subramanian S/o Raman' and 'Subramanian S/o Krishnan'
    remain distinct graph nodes with composite identity hashing to prevent false merges.
    """
    engine = TitleGraphEngine()

    p1 = PersonNode(
        name="Subramanian",
        father_or_husband_name="Raman",
        relationship="S/o",
    )
    p2 = PersonNode(
        name="Subramanian",
        father_or_husband_name="Krishnan",
        relationship="S/o",
    )

    k1 = engine.add_person(p1)
    k2 = engine.add_person(p2)

    # Composite keys must differ
    assert k1 != k2, f"Expected distinct keys, got identical '{k1}'"
    assert "raman" in k1
    assert "krishnan" in k2

    # Graph must preserve two distinct nodes
    assert engine.graph.number_of_nodes() == 2
    assert engine.graph.has_node(k1)
    assert engine.graph.has_node(k2)

    # Adding p1 again should update existing node without creating a third node
    engine.add_person(p1)
    assert engine.graph.number_of_nodes() == 2
