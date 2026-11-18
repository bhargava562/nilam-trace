# NilamTrace — Title Graph & Red-Zone Radar Specification

## 1. NetworkX Directed Graph Architecture

NilamTrace represents property succession, transfers, and mutations as a directed acyclic graph $G = (V, E)$ via `networkx.DiGraph`.

### Node Types
1. **PersonNode:** Represents an individual owner or heir.
   - Key: Composite normalized tuple `(normalized_name, father_or_husband_name)`
   - Prevents homonym collisions (e.g., "Subramanian S/o Raman" vs. "Subramanian S/o Krishnan").
2. **DocumentNode:** Represents a formal legal instrument (`DEED`, `PATTA`, `EC_ENTRY`).
3. **ParcelNode:** Represents a physical plot with a specific survey number and extent.

### Edge Types
- `CONVEYED_VIA` (Deed $\to$ Person)
- `SUCCESSION_HEIR` (Deceased Person $\to$ Living Heir)
- `MUTATED_TO` (Pre-mutation record $\to$ Patta)
- `SUBDIVIDED_INTO` (Parent survey $\to$ Subdivision)

---

## 2. Red-Zone Radar (Tenure Gate)

Before running title continuity or valuation checks, the land classification is checked against restricted tenure categories. If any token matches, loan and sale preparation is halted immediately:

| Category | Keywords (English & Tamil) | Legal Consequence |
|---|---|---|
| **Poramboke / Government** | `poramboke`, `புறம்போக்கு`, `sarkar`, `அரசு` | Non-alienable; private mortgages prohibited. |
| **Grazing / Commons** | `meikkal`, `மேய்ச்சல்`, `mandhai`, `மந்தை` | Village common land; assignment restricted. |
| **Temple / Devasthanam** | `kovil`, `கோவில்`, `temple`, `devasthanam`, `இந்து சமய அறநிலையம்` | HR&CE clearance required; private sale illegal. |
| **Waqf Board** | `waqf`, `வக்பு`, `pallivasal` | Section 51 Waqf Act prohibition. |
| **Waterbody** | `waterbody`, `kulam`, `குளம்`, `eri`, `ஏரி`, `vaikkal`, `வாய்க்கால்` | High Court absolute eviction mandate. |
| **Panchami / Assigned** | `panchami`, `பஞ்சமி`, `depressed class`, `assigned` | Alienation to non-SC/ST void ab initio. |

---

## 3. Old-to-New Survey Reconciliation (1984 UDR Resurvey)

Under the Tamil Nadu Updating Registry Scheme (UDR), historical survey numbers were renumbered into new survey numbers and subdivisions:
- **Heuristic:** If $S_{\text{deed}} \ne S_{\text{patta}}$, the engine checks for explicit correlation entries in the Integrated Land Record (ILR) or Encumbrance Certificate notes.
- **Result:** Instead of raising a false discrepancy, the engine emits `RESOLVED_UDR_SURVEY_LINK` with an educational green badge linking Old S.No `45/2` to New S.No `114/2B`.
