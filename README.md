# DocAssist — Simple RAG Document Assistant

A tiny, zero-config Retrieval-Augmented Generation app.
**Upload a PDF → ask questions → get answers with the source page cited.**

No Postgres. No Docker. No Kubernetes. Two `npm`/`pip` commands and you're chatting with your documents.

---

## How it works

```
┌────────────┐   1. upload PDF        ┌────────────┐
│  Frontend  │ ─────────────────────► │  Backend   │
│ React +    │   2. ask a question    │  FastAPI   │
│ Tailwind   │ ◄──── answer + cite ── │            │
└────────────┘                        └─────┬──────┘
                                            │
       ┌────────────────────────────────────┼─────────────────────────────┐
       ▼                                    ▼                             ▼
 ┌───────────┐                       ┌─────────────┐               ┌────────────┐
 │  SQLite   │  users, docs, chunks  │   FAISS     │  vector       │  LLM API   │
 │  app.db   │  query history        │  faiss.index│  similarity   │  (Groq /   │
 └───────────┘                       └─────────────┘               │  OpenAI /  │
                                                                   │  Gemini)   │
                                                                   └────────────┘
```

1. PDF is parsed → split into ~800-char chunks.
2. Each chunk is embedded with `all-MiniLM-L6-v2` (CPU, 384-dim).
3. Vectors go into a FAISS file; chunk text goes into SQLite.
4. On a question: embed it → FAISS finds top 5 similar chunks → send them as context to the LLM → return the answer plus the source filename + page.

---

## Tech stack


| Layer         | Tool                                     | Where it lives                              | Why this choice                            |
| ------------- | ---------------------------------------- | ------------------------------------------- | ------------------------------------------ |
| Web framework | **FastAPI** (Uvicorn)                    | `backend/app/main.py`                       | Async, typed, OpenAPI built-in             |
| Metadata DB   | **SQLite**                               | `backend/data/app.db` *(auto-created)*      | Zero setup; one file, no server            |
| Vector index  | **FAISS** (`IndexFlatIP`)                | `backend/data/faiss.index` *(auto-created)* | Tiny, fast, file-persisted                 |
| Embeddings    | `sentence-transformers/all-MiniLM-L6-v2` | downloaded to HF cache (~90 MB)             | CPU-friendly, accurate enough for docs     |
| PDF parser    | `pypdf`                                  | `backend/app/rag.py`                        | Pure-Python, no system deps                |
| LLM           | Groq / OpenAI / Google Gemini            | chosen via `backend/.env`                   | Pick whichever free key you have           |
| Auth          | **bcrypt** + **JWT** (30-day token)      | `backend/app/auth.py`                       | Standard, no extra service                 |
| Frontend      | **React 19 + Vite + Tailwind 4**         | `frontend/src/`                             | Fast dev, modern UI                        |
| HTTP client   | **axios** (with auth interceptor)        | `frontend/src/lib/api.js`                   | One central place for the base URL + token |


There are four tables in SQLite: `users`, `documents`, `chunks`, `query_logs`. They're created automatically on the first backend start.

---

## Prerequisites

- **Python 3.10 – 3.13** (any 64-bit OS — macOS Intel/Apple Silicon, Windows, Linux)
- **Node.js 18+**
- ~1 GB free disk (torch + embedding model are downloaded once)
- ~2 GB RAM free while the backend is running
- An API key from **one** of:
  - Groq — [https://console.groq.com](https://console.groq.com) (free)
  - Google AI Studio — [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (free)
  - OpenAI — [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

---

## Setup

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env              # Windows: copy .env.example .env
```

Open `backend/.env` and fill **one** API key + a random JWT secret:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
# OPENAI_API_KEY=sk-...
# GOOGLE_API_KEY=AIza...

JWT_SECRET=any_long_random_string_here
```

**`JWT_SECRET`** signs login tokens. Use a long random value (not a word you reuse elsewhere). Generate one and paste it after `JWT_SECRET=`:

```bash
# macOS / Linux / Windows (with Python installed)
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

Alternatively (macOS / Linux):

```bash
openssl rand -base64 48
```

If you skip this, the app still runs but falls back to a weak default in `auth.py` — fine only for local throwaway testing.

Start the server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> First start downloads the embedding model (~90 MB). Wait until you see `DocAssist API ready.` in the log. Then verify at [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health) — the response should include `llm_provider` and `llm_model`.

### 2. Frontend

In a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually [http://localhost:5173](http://localhost:5173)).

### 3. Use the app

1. Click **Get Started** → **Register** (email + password).
2. Go to **Chat** (or **Documents**), upload a PDF (≤ 25 MB).
3. Ask a question. Answers come back with the source filename + page number.

---

## Switching LLM provider

The backend auto-detects which provider to use based on whichever key is set in `backend/.env`. Fill **one** of:

```env
GROQ_API_KEY=gsk_xxx       # default model: llama-3.1-8b-instant
OPENAI_API_KEY=sk-xxx      # default model: gpt-4o-mini
GOOGLE_API_KEY=AIza...     # default model: gemini-1.5-flash
```

To switch, change the key and restart `uvicorn`. Confirm via [http://localhost:8000/api/health](http://localhost:8000/api/health).

The frontend has no provider setting — it always calls the same backend endpoint.

---

## Project layout

```
DocAssist/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI routes (mounted under /api)
│   │   ├── database.py    # SQLite + SQLAlchemy engine
│   │   ├── models.py      # User, Document, Chunk, QueryLog tables
│   │   ├── schemas.py     # Pydantic request/response models
│   │   ├── auth.py        # bcrypt password hashing + JWT
│   │   └── rag.py         # PDF parsing + FAISS + embedder + LLM dispatch
│   ├── data/              # auto-created: app.db + faiss.index (gitignored)
│   ├── uploads/           # auto-created: original PDFs (gitignored)
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── lib/api.js     # axios client + auth interceptor
        ├── pages/         # Login, Register, Dashboard, Documents, Chat, …
        └── components/    # Layout, AIAssistant, ProfileModal, ThemeToggle
```

---

## API reference

All routes are prefixed with `/api`. CORS is open for development (allows any origin).


| Method | Path                | Auth     | Body / Notes                                             |
| ------ | ------------------- | -------- | -------------------------------------------------------- |
| POST   | `/auth/register`    | —        | `{name, email, password}` → `{access_token, user}`       |
| POST   | `/auth/login`       | —        | `{email, password}` → `{access_token, user}`             |
| GET    | `/auth/me`          | required | Current user                                             |
| POST   | `/documents/upload` | optional | `multipart/form-data` with `file=<pdf>`                  |
| GET    | `/documents/`       | —        | List active documents                                    |
| GET    | `/documents/{id}`   | —        | Single document                                          |
| DELETE | `/documents/{id}`   | —        | Soft-delete + rebuild FAISS index                        |
| POST   | `/chat/query`       | optional | `{query, doc_ids?}` → `{answer, sources, latency_ms}`    |
| GET    | `/chat/history`     | optional | Recent queries (filtered to current user when logged in) |
| GET    | `/stats`            | —        | Dashboard counters + recent activity                     |
| GET    | `/health`           | —        | `{status, llm_provider, llm_model}`                      |


When an `Authorization: Bearer <token>` header is sent on optional endpoints, the action is attributed to that user.

---

## Resetting state

To wipe all users, documents, and vectors and start fresh:

```bash
rm -rf backend/data backend/uploads
```

Restart `uvicorn` — it recreates everything empty.

---

## Troubleshooting


| Symptom                                        | Fix                                                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `pip install` fails on `faiss-cpu`             | Your Python version has no matching wheel. Use Python 3.10–3.13 and rerun `pip install -r requirements.txt`. |
| Backend log says `No LLM API key found`        | Fill a key in `backend/.env` and restart `uvicorn` (it doesn't auto-reload env vars).                        |
| First chat is slow (~30 s)                     | One-time embedding model + torch warmup. Subsequent calls are quick.                                         |
| `No extractable text` on upload                | PDF is a scanned image. This minimal stack doesn't OCR — convert it first or upload a text-based PDF.        |
| Frontend shows CORS error                      | Make sure backend is running on `http://localhost:8000` and the frontend on `http://localhost:5173`.         |
| Want to point the frontend at a remote backend | Create `frontend/.env` with `VITE_API_BASE=http://your-host:8000/api`.                                       |


