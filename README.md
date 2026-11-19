# NilamTrace v2 (நிலம்தடம்)

Visit the demo : https://nilam-trace.vercel.app/

> **Assisted Inheritance Documentation & Case-Preparation Companion for Rural Families**  
> *Tech4Bharat 2026 · Problem Statement 1.2 (Real Estate & Land)*

NilamTrace v2 is built specifically around the ground reality of rural Tamil Nadu: **inherited land stuck in a deceased parent's or grandparent's name**. Instead of trying to be an automated "AI title clearance engine" or competing with urban platforms like LandLens/Landeed, NilamTrace owns the **last-mile administrative ladder**: low-literacy Tamil voice intake, multi-visit document tracking, mandatory operator verification, and `<400 KB` e-Sevai portal packaging.

---

## 🎯 How NilamTrace v2 Solves the 7 Ground Setbacks

| Setback | What We Removed | What NilamTrace v2 Builds Instead |
|---|---|---|
| **1. Too Many Problems** | Dropped market valuation models, FMB boundary disputes, and bank underwriting engines. | **100% focus on Inherited-Land Patta Transfer (`Patta Maruthal`)** after an ancestor's death. |
| **2. AI Can't Conjure Missing Papers** | Removed claims that a phone call fetches lost family deeds. | **Physical Document Inventory & Assisted Checklist:** Explicitly tracks **Documents Possessed** vs. **Documents Still Unavailable** (e.g. Death Certificate, `REV-114` Legal Heir Certificate) with step-by-step instructions. |
| **3. Government Access Not Guaranteed** | Removed all claims of automated portal scraping or live government APIs. | **100% Upload & Authorized Operator-Assisted Path:** Operator scans physical papers or uploads citizen-downloaded PDFs. Zero scraping, zero broken bots. |
| **4. Speakerphone Legal Risk** | Removed verbal partition claims or automated share-splitting. | **Voluntary Family Information Log:** Records self-reported family structure with mandatory statutory disclaimer: *"Informational family tree only — formal transfer requires Varisu Certificate (`REV-114`) and, if relinquishing shares, a Registered Release/Partition Deed."* |
| **5. No Ground-Truth OCR Accuracy** | Removed blanket accuracy claims and automatic field acceptance. | **Field-Level Confidence + Mandatory Human Verification Gate:** Every critical field (`survey_no`, `deceased_owner`, `applicant_name`) requires explicit human verification / correction before export. |
| **6. Unproven Economics** | Removed unverified "₹25,000 broker savings" claims. | **Transparent Pilot Cost & Time Tracker:** Tracks actual statutory fees (₹60 e-Sevai fee for `REV-114` / Patta transfer) and measures real operator time savings (45m $\to$ 12m). |
| **7. Overtaken by LandLens/Landeed** | Stopped competing on generic "39 automated AI checks". | **Case Continuity & Last-Mile Packaging:** Persistent **4-Digit Case Pocket Code (`#4821`)** across multiple café visits + Tamil Nilam `<400 KB` scan optimizer + official VAO readiness packet. |

---

## 🏛️ The 3-Act User Journey

```
[ Act 1: Low-Literacy Tamil Voice Intake ]
       │ Farmer speaks in plain Tamil describing inherited land
       ▼
[ Pocket Code #4821 + Initial Checklist ]
       │ Persists across weeks as family gathers papers
       ▼
[ Act 2: Assisted Scanning & Document X-Ray ]
       │ 90% Dimmed Spotlight on Deceased Name, Survey No, & Extent
       ├── Missing Document Tracker: REV-114 Missing ❌ (Fee: ₹60 at e-Sevai)
       └── Mandatory Human Field Verification: Operator checks each field
       │
[ Act 3: Path Choice, 400KB Squeeze & HITL Gate ]
       │ Option A: Joint Patta (₹0 Stamp Duty) vs Option B: Release Deed (1% Duty)
       │ The 400 KB Squeeze Machine (Adaptive DPI/JPEG under 390 KB)
       ▼
[ Human-in-the-Loop Gate (PIN 1234) ]
       ├── If REV-114 Missing: Downloads Step 1 Prerequisite Guide
       └── If REV-114 Ready: Downloads Verified Case Preparation Packet PDF
```

---

## ⚖️ Tamil Nadu Administrative Ladder & Fee Comparison

| Path | Legal Mechanism | Stamp Duty | Reg. Fee | e-Sevai Fee | Best Suited For |
|---|---|:---:|:---:|:---:|---|
| **Option A: Joint Patta (கூட்டுப் பட்டா)** | All legal heirs named jointly in Patta | **₹0 (Zero)** | **₹0** | **₹60** | All heirs agree to retain joint ancestral ownership without immediate sale/mortgage. |
| **Option B: Registered Release Deed (விடுதலைப் பத்திரம்)** | Co-heirs relinquish shares before Sub-Registrar | **1% (Capped at ₹25k)** | **1% (Capped at ₹4k)** | **₹60 (+₹400 subdivision)** | One heir obtains sole unencumbered title for bank mortgage or sole agricultural operations. |

---

## 🧪 Comprehensive Automated Test Suite (12 / 12 Passing)

```bash
python -m pytest api/tests/ -v
```

```
api/tests/test_nilamtrace_v2.py::test_missing_varisu_certificate_blocks_patta_filing PASSED [  8%]
api/tests/test_nilamtrace_v2.py::test_unverified_ocr_field_blocks_export PASSED          [ 16%]
api/tests/test_nilamtrace_v2.py::test_voluntary_heir_statement_includes_legal_disclaimer PASSED [ 25%]
api/tests/test_nilamtrace_v2.py::test_joint_patta_vs_release_deed_guidance PASSED       [ 33%]
api/tests/test_nilamtrace_v2.py::test_unit_math_hectare_to_cents_exact PASSED           [ 41%]
api/tests/test_nilamtrace_v2.py::test_400kb_squeeze_compliance PASSED                    [ 50%]
api/tests/test_nilamtrace_v2.py::test_no_automated_govt_scraping_dependency PASSED     [ 58%]
api/tests/test_nilamtrace_v2.py::test_hitl_approval_gate_enforced PASSED                 [ 66%]
api/tests/test_nilamtrace_v2.py::test_multi_visit_case_continuity PASSED                 [ 75%]
api/tests/test_nilamtrace_v2.py::test_low_confidence_field_flags_review PASSED          [ 83%]
api/tests/test_nilamtrace_v2.py::test_llm_timeout_engages_regex_fallback PASSED          [ 91%]
api/tests/test_nilamtrace_v2.py::test_end_to_end_verified_packet_pdf PASSED             [100%]

============================== 12 passed in 2.84s ==============================
```

---

## 📁 Repository Architecture

NilamTrace v2 is organized as a clean, decoupled polyglot monorepo:

```
nilam/
├── api/                   # Isolated FastAPI Backend Engine
│   ├── index.py           # FastAPI entrypoint (app = FastAPI())
│   ├── config.py          # Settings & api/.env loader
│   ├── requirements.txt   # Python dependencies
│   ├── services/          # Inheritance rules, unit math, PDF squeeze, AI extractor
│   ├── models/            # Pydantic schemas
│   ├── tests/             # 12 automated verification tests
│   ├── .env.example       # Backend environment template
│   └── README.md          # Backend documentation & test commands
│
├── web/                   # Isolated Next.js 16 (Turbopack) Frontend
│   ├── app/               # Next.js App Router (100vh Mission Control)
│   ├── components/        # Act 1 (Phone), Act 2 (X-Ray), Act 3 (Drawer)
│   ├── i18n/              # 3-Language switcher (Tamil, English, Hindi)
│   ├── package.json       # Next.js dependencies & scripts
│   ├── next.config.ts     # Dev origins & API rewrites
│   ├── .env.example       # Frontend environment template
│   └── README.md          # Frontend documentation & build instructions
│
├── docs/                  # In-depth architectural & regulatory documentation
├── vercel.json            # Vercel Services multi-service configuration
└── README.md              # Root overview
```

---

## 🚀 Quickstart & Local Execution

### 1. Backend Server (FastAPI)
```bash
cd api
pip install -r requirements.txt
uvicorn index:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Application (Next.js)
```bash
cd web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Vercel Deployment Guide

### Option 1: Vercel Dashboard (Standard Frontend Deployment)
1. Import the repository in [Vercel Dashboard](https://vercel.com/new).
2. Set **Root Directory** to `web`.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: URL of your deployed FastAPI backend.
   - `API_BACKEND_URL`: URL of your deployed FastAPI backend (for server-side rewrites).
4. Deploy!

### Option 2: Vercel Services (Multi-Service Monorepo)
The root [`vercel.json`](vercel.json) defines both `web` and `api` services for multi-service deployment:
```bash
vercel
```
