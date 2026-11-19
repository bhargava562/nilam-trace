# NilamTrace v2 - FastAPI Backend

Assisted Inheritance Documentation & Case-Preparation Engine for Tamil Nadu Land Records.

## Architecture

- **`index.py`**: FastAPI application entrypoint with Universal CORS, HITL validation, and dossier export routes.
- **`config.py`**: Runtime configuration loading `api/.env` (Groq API, timeouts, origins).
- **`services/`**:
  - `inheritance_rules.py`: Legal hierarchy logic (REV-114 Varisu certificate verification, Joint Patta vs Release Deed).
  - `unit_math.py`: Tamil Nadu revenue land measurement arithmetic (Ares/Hectares to Cents).
  - `pdf_compressor.py`: Deterministic `<400 KB` PDF compression for Tamil Nilam portal compliance.
  - `dossier_generator.py`: e-Sevai ready application packet PDF generation with QR integrity proof.
  - `ai_extractor.py`: Hybrid Groq Cloud LLM (`llama-3.3-70b-versatile`) with regex fallback for Tamil document fields.
- **`tests/`**: Automated verification test suite.

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn index:app --reload --port 8000
```

## Running Verification Tests

```bash
python -m pytest tests/ -v
```
