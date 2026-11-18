# NilamTrace — Architecture Specification

## 1. System Overview

NilamTrace is structured as a Vercel-ready monorepo combining a Python FastAPI serverless backend under `/api` and a Next.js 15 App Router frontend with Tailwind CSS and Framer Motion.

```
                    ┌──────────────────────────────────────────────┐
                    │               Client Browser                 │
                    │   (Farmer Phone Sim / Café Desk / Banker)    │
                    └──────────────────────┬───────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │                                     │
                        ▼                                     ▼
             ┌─────────────────────┐               ┌────────────────────┐
             │ Next.js 15 Frontend │               │  Python 3.12 API   │
             │   (App Router)      │               │     (FastAPI)      │
             │   - Act 1, 2, 3     │ ──fetch()───▶ │   - Unit Math      │
             │   - Web Speech API  │               │   - Title Graph    │
             │   - SVG Laser Lines │               │   - 400KB Squeeze  │
             │   - Bank Scorecard  │               │   - ReportLab PDF  │
             └─────────────────────┘               └──────────┬─────────┘
                                                              │
                                                   ┌──────────┴─────────┐
                                                   ▼                    ▼
                                         ┌──────────────────┐  ┌────────────────┐
                                         │ In-Memory Store  │  │ Groq Cloud API │
                                         │ (Stateful Cases) │  │ (Optional LLM) │
                                         └──────────────────┘  └────────────────┘
```

## 2. Monorepo & Vercel Routing

The root `vercel.json` coordinates all incoming HTTP traffic:
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "/nilam-trace-web/$1"
    }
  ]
}
```

## 3. Data & State Management

To eliminate external database latency and connection failures during demo evaluations, NilamTrace uses a thread-safe in-memory store (`api/store/memory_store.py`) protected by `threading.Lock`:
- **Pre-Hydrated Cold Starts:** Canonical cases `#4821` (Thiruvallur Loan Rescue) and `#9012` (Poramboke Red-Zone Trap) are instantly hydrated on application start.
- **Defensive Deep Copying:** Returns and updates state defensively to prevent mutation races across async requests.
- **Client Fallback:** The frontend client (`nilam-trace-web/lib/apiClient.ts`) includes local mirror data so that all views, animations, and spotlighting function even during local network disconnects.

## 4. API Endpoints Contract

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck verifying FastAPI, PyMuPDF, and memory store. |
| `GET` | `/api/cases` | Lists all active cases. |
| `GET` | `/api/cases/{case_id}` | Retrieves full state of a case (e.g., 4821 or 9012). |
| `POST` | `/api/intake/voice` | Ingests spoken/simulated Tamil transcript and creates 4-digit pocket code. |
| `POST` | `/api/cases/{case_id}/analyze` | Triggers document extraction, deterministic unit math, and title graph analysis. |
| `POST` | `/api/cases/{case_id}/family-shares` | Records speakerphone heir confirmation (Murugan 50%, Selvi 50%). |
| `POST` | `/api/squeeze-pdf` | Runs the 400 KB Squeeze Machine on uploaded PDF and returns metrics. |
| `POST` | `/api/cases/{case_id}/hitl-approve` | Verifies voice + officer OTP (1234) and unlocks dossier generation. |
| `GET` | `/api/cases/{case_id}/dossier.pdf` | Streams generated QR-stamped VAO Petition & Bank Collateral Dossier (403 prior to approval). |
