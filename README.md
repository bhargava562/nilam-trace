# NilamTrace (நிலம்தடம்)

> **Evidence-Grounded Agentic Land Record Intelligence & Case-Preparation System**  
> *Tech4Bharat 2026 · Problem Statement 1.2 (Real Estate & Land)*

NilamTrace bridges the critical gap between downloading raw, complex government land PDFs and actually understanding why an inheritance mutation, bank loan, or land sale is blocked. Built specifically for rural landowners, JanAI Café / e-Sevai operators, and bank credit officers in Tamil Nadu.

---

## 🏛️ The Ground Reality & Problem

In rural Tamil Nadu, land is a family's primary financial asset (often worth ₹10L–₹50L), yet millions cannot borrow against or sell their land because their title chain is tangled across decades of fragmented paperwork:
1. **Unregistered Family Succession:** Patta remains in the name of a deceased ancestor because no registered mutation occurred.
2. **Deterministic Area Shrinkage:** Re-survey or unrecorded subdivisions cause differences between historical Sale Deeds (Acres/Cents/Kuzhi) and modern Integrated Land Records (Hectares/Ares).
3. **Old-to-New Survey Clashes:** 1984 UDR settlements changed survey numbering (e.g., Old S.No 45/2 $\to$ New S.No 114/2B), causing automated bank rejections.
4. **Restricted Land Traps (Poramboke / Waqf / Temple):** Families waste months and money on broker fees before discovering land is classified as Meikkal Poramboke (grazing) in the village A-Register.
5. **Government Portal 400 KB Caps:** Tamil Nilam strictly rejects scanned deeds $>400\text{ KB}$, leading operators to over-compress and blur crucial stamps and survey marginalia.

---

## 💡 The NilamTrace Solution

NilamTrace replaces predatory ₹15,000–₹25,000 middlemen with a transparent **₹300 JanAI Café Assisted Preparation Workflow** and a **B2B Bank Collateral Readiness Scorecard**:

```
[ Rural Farmer (விவசாயி) ] 
       │  Zero-App Missed-Call Voice Simulator (Tamil STT / TTS)
       ▼
[ 4-Digit Pocket Code #4821 ]
       │  Walk-in to local JanAI Café / e-Sevai
       ▼
[ Document X-Ray & Forensic Spotlight ]
       │  PyMuPDF + 90% Dimmed Mask + Glowing Spotlights + SVG Laser Lines
       ├── Deterministic Unit Math Engine (1 Ha = 247.105381 Cents)
       ├── NetworkX Chain-of-Title Graph & Poramboke Red-Zone Radar
       └── 400 KB Squeeze Machine (Adaptive DPI & JPEG Deflate)
       │
[ Speakerphone Family Panchayat ]
       │  Murugan (50%) & Selvi (50%) Voice Consent
       ▼
[ Mandatory HITL Safety Gate ]
       │  Tamil Voice Summary + Officer OTP (1234)
       ▼
[ Official QR-Stamped VAO Petition & Bank Collateral Dossier PDF ]
```

---

## 🎨 Visual Design System (Strict Utility Tokens)

Modeled after authentic Tamil Nadu e-Sevai & NIC portals combined with forensic document spotlighting:
- **Primary Canvas:** `#FFFFFF` (Crisp paper white)
- **Secondary Surface:** `#F4F7F5` (Soft TN utility off-white)
- **Dimmed PDF Mask:** `rgba(15, 23, 42, 0.72)` (Dims 90% of legal boilerplate, illuminating only verified evidence)
- **Primary Brand / Header:** `#0B6E4F` (Tamil Nadu Revenue Forest Green)
- **Primary Hover / Active:** `#08523B`
- **Text Primary:** `#111827` (High-contrast charcoal ink)
- **Border / Divider:** `#D1DBD5` (1px utility border)
- **Alert Critical:** `#DC2626` / `#FEF2F2` (Red-Zone / Broken link)
- **Alert Warning:** `#D97706` / `#FFFBEB` (Uncertainty / Pending gate)
- **Verified Stamp:** `#15803D` / `#F0FDF4` (Approved link)

### Typography
- **English UI:** `Plus Jakarta Sans` (Weights: 500, 600, 700)
- **Tamil Script UI:** `Noto Sans Tamil` (Weights: 400, 500, 600, 700)
- **Numbers & Math:** `JetBrains Mono` (Weights: 500, 700)

---

## 📁 Repository Structure

```
.
├── .env.example                     # Environment variables template (GROQ_API_KEY)
├── vercel.json                      # Monorepo routing (/api/* to FastAPI, /* to Next.js)
├── requirements.txt                 # Python dependencies
├── pytest.ini                       # Test suite configuration
├── api/                             # Python FastAPI Serverless Backend
│   ├── index.py                     # App entrypoint, CORS, exception handlers
│   ├── config.py                    # Groq settings & model configuration
│   ├── models/schemas.py            # Strict Pydantic v2 schemas
│   ├── store/memory_store.py        # Thread-safe in-memory store (#4821, #9012)
│   ├── services/
│   │   ├── unit_math.py             # Deterministic Tamil unit converter
│   │   ├── title_graph.py           # NetworkX Chain-of-Title & Red-Zone detector
│   │   ├── pdf_compressor.py        # The 400 KB Squeeze Machine
│   │   ├── ai_extractor.py          # Groq extractor + regex fallback
│   │   ├── pdf_extractor.py         # PyMuPDF coordinate bbox extractor
│   │   └── dossier_generator.py     # ReportLab QR-stamped PDF builder
│   ├── sample_docs/                 # Watermarked sample PDFs
│   └── tests/                       # 12 Automated Unit & Integration Tests
├── nilam-trace-web/                 # Next.js 15 App Router Frontend
│   ├── app/                         # App router pages & layouts
│   ├── components/                  # TopNavBar, Act 1, Act 2, Act 3, Bank Scorecard
│   ├── i18n/                        # Bilingual dictionaries (en.json, ta.json)
│   ├── lib/apiClient.ts             # Typed API client with offline fallback
│   └── types/nilamtrace.ts          # TypeScript type definitions
└── docs/                            # Deep Architecture Specifications
    ├── ARCHITECTURE.md              # System design & Vercel serverless integration
    ├── UNIT_MATH_SPEC.md            # Exact Tamil Nadu revenue arithmetic rules
    ├── TITLE_GRAPH_SPEC.md          # NetworkX title continuity & red-zone rules
    ├── SQUEEZE_MACHINE_SPEC.md      # 400 KB compression pipeline
    ├── HITL_AND_SECURITY.md         # Mandatory Human-in-the-Loop consent audit
    └── DEMO_WALKTHROUGH.md          # 60-second judge walkthrough guide
```

---

## ⚡ Core Algorithmic Engines

### 1. Deterministic Revenue Unit Converter (`api/services/unit_math.py`)
LLMs never calculate areas. All conversions follow Tamil Nadu Revenue Department standards:
- $1\text{ Acre} = 100\text{ Cents} = 43,560\text{ sq.ft}$
- $1\text{ Hectare} = 100\text{ Ares} = 247.105381\text{ Cents} = 107,639.104\text{ sq.ft}$
- $1\text{ Are} = 2.471054\text{ Cents} = 1,076.391\text{ sq.ft}$
- $1\text{ Kuzhi} = 144\text{ sq.ft} = 0.330578\text{ Cents}$
- $1\text{ Ground} = 2,400\text{ sq.ft} = 5.50964\text{ Cents}$
- **Discrepancy Tolerance:** $\epsilon = \max(0.25\text{ Cents}, 0.01 \times A_{\text{deed}})$

### 2. Red-Zone Radar & UDR Linker (`api/services/title_graph.py`)
- **Red-Zone Gate:** Halts loan/sale preparation if land is marked as `Poramboke`, `Meikkal`, `Kovil`, `Waqf`, or `Waterbody`.
- **UDR Link:** Maps Old S.No `45/2` to New S.No `114/2B` with green continuity badge.
- **Homonym Protection:** Composite keys `(normalized_name, father_name)` prevent illegal merges.

### 3. The 400 KB Squeeze Machine (`api/services/pdf_compressor.py`)
- **Pass 1:** Lossless stream deflation (`garbage=4, deflate=True`).
- **Pass 2:** Adaptive DPI ($\in [150, 120, 96, 72]$) and JPEG quality ($\in [75, 60, 45]$) under $390\text{ KB}$.
- **Pass 3:** Multi-part auto-splitter (`Part_1_Schedule.pdf`, `Part_2_Annexures.pdf`) preventing text blurring.

---

## 🧪 Comprehensive Test Suite (12 / 12 Tests Passing)

Run the full automated pytest suite:
```bash
python -m pytest api/tests/ -v
```

All 12 tests pass cleanly with zero warnings:
- `test_hectare_to_cents_exact` (0.17.5 Ha $\to$ 43.2434 Cents)
- `test_shrinkage_detection` (48.0 Cents vs 43.24 Cents flags -4.76 Cents)
- `test_udr_rounding_tolerance` (1.00 Acre vs 0.40.5 Ha passes as MATCHED)
- `test_kuzhi_and_ground_conversion` (300 Kuzhi = 99.17 Cents, 2 Grounds = 11.02 Cents)
- `test_deceased_pattadhar_blocks_direct_loan` (Deceased owner triggers heir check)
- `test_poramboke_red_zone_halt` (Case #9012 Meikkal halts loan file)
- `test_old_to_new_survey_correlation` (Old 45/2 $\to$ New 114/2B verified)
- `test_homonym_separation` (Subramanian S/o Raman $\ne$ Subramanian S/o Krishnan)
- `test_cold_start_sample_cases_exist` (Cases #4821 and #9012 return 200 OK)
- `test_400kb_squeeze_compliance` (Compresses $>2.5\text{ MB}$ to $\le 400\text{ KB}$)
- `test_hitl_gate_enforces_lock` (Dossier download locked with 403 Forbidden before OTP)
- `test_full_e2e_approval_and_pdf_generation` (Voice $\to$ X-Ray $\to$ Split $\to$ OTP 1234 $\to$ %PDF- stream)

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Install Python requirements
python -m pip install -r requirements.txt

# Configure environment (optional GROQ_API_KEY)
cp .env.example .env

# Run FastAPI backend
python -m uvicorn api.index:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd nilam-trace-web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚖️ Trust & Safety Boundary

NilamTrace explicitly enforces strict civic guardrails:
- **Does NOT** legally certify title or replace the District Collectorate / Sub-Registrar.
- **Does NOT** perform black-box AI price predictions; reports official Guideline Value floor + verified comparables.
- **Locks** all legal petition generation behind mandatory Human-in-the-Loop spoken Tamil + OTP verification.
- All generated dossiers are watermarked: *“Preliminary Evidence-Grounded Case Preparation — Subject to Official Revenue/Legal Verification”*.

---

## 👥 Authors
Built for **Tech4Bharat 2026** (Problem Statement 1.2: Real Estate & Land / Agentic AI).
