# NilamTrace v2 - Next.js Frontend

The zero-scroll Mission Control interface for NilamTrace v2: Low-Literacy Tamil Voice Intake, Document X-Ray, Legal Heir Log, and e-Sevai Packet Generation.

## Setup & Environment

1. Duplicate `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure your backend URL (defaults to `http://127.0.0.1:8000` for local development):
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   API_BACKEND_URL=http://127.0.0.1:8000
   NEXT_PUBLIC_APP_ENV=development
   ```

## Development

```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

The application runs at [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
npm run build
npm run start
```

## Vercel Deployment

When importing this repository into Vercel:
- **Root Directory**: Select `web`
- **Framework Preset**: Next.js (automatically detected)
- **Environment Variables**: Add `NEXT_PUBLIC_API_URL` (pointing to your deployed FastAPI backend)
