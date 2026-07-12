import os

from flask import Flask, jsonify, request

from scorer import extract_keywords_from_text, get_ranking_result
from text_extractor import extract_text_from_url


app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify({"ok": True, "service": "hiresense-ranking"})


@app.post("/extract-url")
def extract_url():
    data = request.get_json(silent=True) or {}
    file_url = data.get("file_url")
    original_name = data.get("original_name")

    if not file_url:
        return jsonify({"error": "Missing file_url"}), 400

    try:
        text = extract_text_from_url(file_url, original_name)
        keywords = extract_keywords_from_text(text)
        return jsonify({"text": text, "character_count": len(text), "keywords": keywords})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.post("/rank")
def rank():
    data = request.get_json(silent=True) or {}
    job_text = data.get("job_text", "")
    candidate_text = data.get("candidate_text", "")

    if not job_text or not candidate_text:
        return jsonify({"error": "Missing job_text or candidate_text"}), 400

    result = get_ranking_result(job_text, candidate_text)
    return jsonify(result)


if __name__ == "__main__":
    port = int(os.getenv("RANKING_SERVICE_PORT", "5001"))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG") == "1")
