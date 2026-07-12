# HireSense Python Ranking Service

This microservice performs the NLP ranking work for HireSense.

## Setup

```bash
cd python-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The service runs on `http://127.0.0.1:5001` by default.

The Next.js app reads `RANKING_SERVICE_URL` and falls back to `http://127.0.0.1:5001` when it is not set.

## Endpoints

- `GET /health`
- `POST /extract-url` with `{ "file_url": "...", "original_name": "resume.pdf" }`
- `POST /rank` with `{ "job_text": "...", "candidate_text": "..." }`

The `/rank` endpoint applies tokenization, stopword removal, lemmatization, TF-IDF vectorization, and cosine similarity.

If NLTK corpora are not installed, the scorer still works by falling back to built-in English stopwords and stemming.
