# Plateforme Gestion Scolaire + IA — Final (PDF + Omnivox-style)

**Stack**
- API Gateway (Node/Express) — JWT + `x-college-id` + proxy
- Auth Service (Node/Express + MongoDB) — `/auth/login`, `/colleges`, `/users`
- Academic Service (Node/Express + MongoDB) — programmes, sessions, cours, inscriptions, **notes avec `{ category, title, score, group_score, poid }`**, documents, bulletin global
- IA Service (FastAPI) — `/ia/realtime`, `/ia/final`

**MongoDB**: local (ex: `mongodb://localhost:27017`), chaque collection contient `collegeId`.

## Démarrage
```bash
# 1) API Gateway
cd api-gateway && cp .env.example .env && npm install && npm run dev

# 2) Auth Service
cd ../auth-service && cp .env.example .env && npm install && npm run dev

# 3) Academic Service
cd ../academic-service && cp .env.example .env && npm install && npm run dev

# 4) IA Service (FastAPI)
cd ../ia-service && python -m venv .venv && source .venv/bin/activate  # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 4003
```

## Routes principales (PDF)
- `POST /auth/login`
- `POST /colleges`
- `POST /users`
- `GET  /academic/courses`
- `POST /academic/grades`  (format: `{ category, title, score, group_score, poid }`)
- `POST /academic/documents`
- `GET  /academic/bulletin/global?studentId=...`
- `POST /ia/realtime`
- `POST /ia/final`
