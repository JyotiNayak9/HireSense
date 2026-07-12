import re
from typing import Dict, List, Optional, Set, Tuple

import numpy as np
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import wordpunct_tokenize
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


ALGORITHM_NAME = "tfidf_cosine_domain_v2"

DOMAIN_STOP_WORDS = {
    "ability",
    "able",
    "about",
    "across",
    "and",
    "apply",
    "based",
    "candidate",
    "company",
    "create",
    "creating",
    "day",
    "deliver",
    "dynamic",
    "ensure",
    "environment",
    "excellent",
    "familiarity",
    "fast",
    "good",
    "great",
    "help",
    "including",
    "join",
    "knowledge",
    "looking",
    "manage",
    "must",
    "opportunity",
    "plus",
    "preferred",
    "proficiency",
    "proficient",
    "provide",
    "responsibilities",
    "responsibility",
    "responsible",
    "requirement",
    "requirements",
    "required",
    "role",
    "seeking",
    "solid",
    "strong",
    "support",
    "team",
    "using",
    "work",
    "working",
}

TECH_NORMALIZATIONS = {
    "tailwind css": "tailwindcss",
    "react native": "react native",
    "node.js": "node",
    "nodejs": "node",
    "react.js": "react",
    "next.js": "next",
    "nextjs": "next",
    "vue.js": "vue",
    "express.js": "express",
    "restful api": "rest api",
    "restful apis": "rest api",
    "apis": "api",
    "postgres sql": "postgresql",
    "postgres": "postgresql",
    "power bi": "powerbi",
    "google cloud": "gcp",
    "ci/cd": "ci cd",
    "ui/ux": "ui ux",
    "c++": "cplusplus",
    "c#": "csharp",
    ".net": "dotnet",
}

SKILL_TERMS = [
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Express.js",
    "Vue.js",
    "Angular",
    "HTML",
    "CSS",
    "Tailwind CSS",
    "Bootstrap",
    "Redux",
    "GraphQL",
    "REST API",
    "API integration",
    "MongoDB",
    "Mongoose",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "SQLite",
    "Oracle",
    "Firebase",
    "Redis",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "Git",
    "GitHub",
    "CI/CD",
    "DevOps",
    "Linux",
    "Flask",
    "Django",
    "FastAPI",
    "Spring Boot",
    "Laravel",
    "PHP",
    "Ruby",
    "Rails",
    "Go",
    "R",
    "C++",
    "C#",
    ".NET",
    "Swift",
    "Kotlin",
    "Android",
    "iOS",
    "React Native",
    "Flutter",
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
    "Pandas",
    "NumPy",
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "Data Science",
    "Data Analysis",
    "Data Analytics",
    "Computer Vision",
    "Power BI",
    "Tableau",
    "Excel",
    "ETL",
    "Spark",
    "Hadoop",
    "Kafka",
    "Microservices",
    "Unit Testing",
    "Jest",
    "Cypress",
    "Playwright",
    "Selenium",
    "QA",
    "Figma",
    "UI/UX",
    "UX Design",
    "SEO",
    "WordPress",
    "Shopify",
    "CRM",
    "Salesforce",
    "HubSpot",
    "Agile",
    "Scrum",
    "Jira",
    "Project Management",
    "Communication",
    "Leadership",
    "Problem Solving",
    "Customer Service",
    "Customer Support",
    "Marketing",
    "Content Writing",
    "Copywriting",
    "Social Media",
    "Graphic Design",
]

EDUCATION_TERMS = [
    "Bachelor",
    "Master",
    "PhD",
    "Doctorate",
    "Diploma",
    "Certification",
    "Certified",
    "Computer Science",
    "Information Technology",
    "Software Engineering",
    "Data Science",
    "Business Administration",
    "Finance",
    "Accounting",
    "Engineering",
    "Mathematics",
    "Statistics",
]

EXPERIENCE_TERMS = [
    "Internship",
    "Intern",
    "Entry level",
    "Junior",
    "Mid level",
    "Senior",
    "Lead",
    "Manager",
    "Management",
    "Professional experience",
    "Work experience",
]

CATEGORY_WEIGHTS = {
    "skill": 1000.0,
    "experience": 850.0,
    "education": 750.0,
}

SECTION_BONUSES = {
    "skill": 450.0,
    "experience": 300.0,
    "education": 300.0,
}

APPLICATION_FIELD_BONUS = 650.0
RESUME_FIELD_BONUS = 150.0

GENERIC_PREFIX_PATTERN = re.compile(
    r"^(strong|advanced|excellent|good|solid|proven|hands on|experience with|"
    r"knowledge of|familiarity with|proficiency in|proficient in|using)\s+"
)

YEAR_EXPERIENCE_PATTERN = re.compile(
    r"\b(?:\d{1,2}\+?|one|two|three|four|five|six|seven|eight|nine|ten)\s*"
    r"(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)?\b"
)

WORD_NUMBER_VALUES = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
}


def normalize_technical_terms(text: str) -> str:
    normalized = text.lower()
    for source, replacement in TECH_NORMALIZATIONS.items():
        normalized = normalized.replace(source, replacement)
    return normalized


def _clean_term(term: str) -> str:
    cleaned = normalize_technical_terms(term)
    cleaned = cleaned.replace("&", " and ")
    cleaned = re.sub(r"[^a-z0-9+#.\s-]", " ", cleaned)
    cleaned = cleaned.replace("-", " ")
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" .:-")

    previous = None
    while cleaned and previous != cleaned:
        previous = cleaned
        cleaned = GENERIC_PREFIX_PATTERN.sub("", cleaned).strip()

    return cleaned


DISPLAY_TERMS: Dict[str, str] = {}
PRIORITY_TERMS: List[Tuple[str, str]] = []


def _register_terms(category: str, terms: List[str]) -> None:
    for display in terms:
        normalized = _clean_term(display)
        if not normalized:
            continue
        PRIORITY_TERMS.append((category, normalized))
        DISPLAY_TERMS.setdefault(normalized, display)


_register_terms("skill", SKILL_TERMS)
_register_terms("education", EDUCATION_TERMS)
_register_terms("experience", EXPERIENCE_TERMS)


STEMMER = PorterStemmer()


def _has_nltk_resource(resource_path: str) -> bool:
    try:
        nltk.data.find(resource_path)
        return True
    except LookupError:
        return False


if _has_nltk_resource("corpora/stopwords"):
    STOP_WORDS = set(stopwords.words("english"))
else:
    STOP_WORDS = set(ENGLISH_STOP_WORDS)

STOP_WORDS = STOP_WORDS.union(DOMAIN_STOP_WORDS).union(
    {STEMMER.stem(word) for word in DOMAIN_STOP_WORDS}
)

HAS_WORDNET = _has_nltk_resource("corpora/wordnet")
LEMMATIZER = WordNetLemmatizer() if HAS_WORDNET else None


def preprocess(text: str) -> str:
    if not text:
        return ""

    text = normalize_technical_terms(text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    tokens = wordpunct_tokenize(text)
    cleaned_tokens: List[str] = []

    for token in tokens:
        if len(token) <= 1 or token in STOP_WORDS:
            continue

        try:
            lemma = LEMMATIZER.lemmatize(token) if LEMMATIZER else STEMMER.stem(token)
        except LookupError:
            lemma = STEMMER.stem(token)

        if lemma and lemma not in STOP_WORDS:
            cleaned_tokens.append(lemma)

    return " ".join(cleaned_tokens)


def _search_text(text: str) -> str:
    normalized = normalize_technical_terms(text)
    normalized = normalized.replace("&", " and ")
    normalized = re.sub(r"[^a-z0-9+#.\n:,\-/\s]", " ", normalized)
    normalized = re.sub(r"[ \t]+", " ", normalized)
    return normalized.strip()


def _term_regex(term: str) -> str:
    escaped = re.escape(term)
    escaped = escaped.replace(r"\ ", r"\s+")
    return rf"(?<![a-z0-9]){escaped}(?![a-z0-9])"


def _term_position(term: str, text: str) -> int:
    match = re.search(_term_regex(term), text)
    return match.start() if match else 1_000_000


def _is_noise_term(term: str) -> bool:
    tokens = term.split()
    if not term or len(term) <= 1 or len(tokens) > 4:
        return True
    if all(token in STOP_WORDS for token in tokens):
        return True
    if any(token in {"skill", "skills", "experience", "education"} for token in tokens) and len(tokens) == 1:
        return True
    return False


def _add_term(
    scores: Dict[str, Tuple[float, int]],
    term: str,
    score: float,
    search_text: str,
    force: bool = False,
) -> None:
    cleaned = _clean_term(term)
    if not force and _is_noise_term(cleaned):
        return

    position = _term_position(cleaned, search_text) if search_text else 1_000_000
    current = scores.get(cleaned)
    if not current or score > current[0] or (score == current[0] and position < current[1]):
        scores[cleaned] = (score, position)


def _known_terms_in_text(text: str) -> List[str]:
    normalized = _search_text(text)
    terms: List[str] = []
    for _, term in PRIORITY_TERMS:
        if re.search(_term_regex(term), normalized):
            terms.append(term)
    return terms


def _add_known_terms_from_text(
    scores: Dict[str, Tuple[float, int]],
    text: str,
    section_bonus: float = 0.0,
) -> None:
    normalized = _search_text(text)
    if not normalized:
        return

    for category, term in PRIORITY_TERMS:
        matches = re.findall(_term_regex(term), normalized)
        if not matches:
            continue

        score = (
            CATEGORY_WEIGHTS[category]
            + section_bonus
            + (len(matches) * 60)
            + (len(term.split()) * 35)
        )
        _add_term(scores, term, score, normalized, force=True)


def _label_category(label: str) -> Optional[str]:
    cleaned = _clean_term(label)
    if "skill" in cleaned or cleaned in {"tools", "technologies", "tech stack"}:
        return "skill"
    if "education" in cleaned or "degree" in cleaned or "certification" in cleaned:
        return "education"
    if "experience" in cleaned or "qualification" in cleaned or "requirement" in cleaned:
        return "experience"
    return None


def _section_bonus(label: str, category: str) -> float:
    cleaned = _clean_term(label)
    bonus = SECTION_BONUSES[category]

    if "application" in cleaned or "form" in cleaned:
        bonus += APPLICATION_FIELD_BONUS
    elif "resume" in cleaned:
        bonus += RESUME_FIELD_BONUS

    return bonus


def _split_labeled_value(value: str) -> List[str]:
    return [
        chunk
        for chunk in re.split(r"[,;|]+|\s+-\s+|\s+and\s+", value)
        if chunk.strip()
    ]


def _add_labeled_terms(scores: Dict[str, Tuple[float, int]], text: str) -> None:
    for line in text.splitlines():
        if ":" not in line:
            continue

        label, value = line.split(":", 1)
        category = _label_category(label)
        if not category:
            continue

        bonus = _section_bonus(label, category)
        _add_known_terms_from_text(scores, value, bonus)

        if category != "skill":
            continue

        line_text = _search_text(value)
        for chunk in _split_labeled_value(value):
            known_terms = _known_terms_in_text(chunk)
            if known_terms:
                continue

            term = _clean_term(chunk)
            if _is_noise_term(term):
                continue

            _add_term(scores, term, CATEGORY_WEIGHTS["skill"] + bonus, line_text)


def _normalize_year_experience(term: str) -> str:
    cleaned = _clean_term(term)
    cleaned = re.sub(r"\byrs?\b", "years", cleaned)
    cleaned = re.sub(r"\bof\b", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if "experience" not in cleaned:
        cleaned = f"{cleaned} experience"
    return cleaned


def _experience_year_value(term: str) -> Optional[int]:
    match = re.search(
        r"\b(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten)\+?\s+years?",
        term,
    )
    if not match:
        return None

    value = match.group(1)
    if value.isdigit():
        return int(value)
    return WORD_NUMBER_VALUES.get(value)


def _add_experience_patterns(scores: Dict[str, Tuple[float, int]], text: str) -> None:
    normalized = _search_text(text)
    for match in YEAR_EXPERIENCE_PATTERN.finditer(normalized):
        term = _normalize_year_experience(match.group(0))
        _add_term(scores, term, CATEGORY_WEIGHTS["experience"] + 500, normalized, force=True)


def _extract_relevant_term_scores(text: str) -> Dict[str, Tuple[float, int]]:
    scores: Dict[str, Tuple[float, int]] = {}
    _add_known_terms_from_text(scores, text)
    _add_labeled_terms(scores, text)
    _add_experience_patterns(scores, text)
    return scores


def _rank_terms(scores: Dict[str, Tuple[float, int]], top_n: int) -> List[str]:
    ranked = sorted(scores.items(), key=lambda item: (-item[1][0], item[1][1], item[0]))
    return [term for term, _ in ranked[:top_n]]


def _display_term(term: str) -> str:
    return DISPLAY_TERMS.get(term, term)


def _term_tokens(term: str) -> List[str]:
    years = _experience_year_value(term)
    if years:
        capped_years = min(years, 15)
        return ["years_experience"] + [
            f"years_experience_{year}" for year in range(1, capped_years + 1)
        ]

    token = re.sub(r"[^a-z0-9]+", "_", term).strip("_")
    return [token] if token else []


def _term_document(scores: Dict[str, Tuple[float, int]]) -> str:
    tokens: List[str] = []
    for term, (score, _) in scores.items():
        repetitions = max(1, min(6, int(score // 300)))
        for token in _term_tokens(term):
            tokens.extend([token] * repetitions)
    return " ".join(tokens)


def _term_matches_candidate(term: str, candidate_terms: Set[str]) -> bool:
    if term in candidate_terms:
        return True

    required_years = _experience_year_value(term)
    if required_years is None:
        return False

    return any(
        candidate_years is not None and candidate_years >= required_years
        for candidate_years in (_experience_year_value(candidate_term) for candidate_term in candidate_terms)
    )


def _ranked_terms(processed_text: str, top_n: int, raw_text: Optional[str] = None) -> List[str]:
    if raw_text is not None:
        scores = _extract_relevant_term_scores(raw_text)
        return [_display_term(term) for term in _rank_terms(scores, top_n)]

    if not processed_text:
        return []

    vectorizer = TfidfVectorizer()
    matrix = vectorizer.fit_transform([processed_text])
    feature_names = vectorizer.get_feature_names_out()
    scores = np.asarray(matrix.sum(axis=0)).ravel()
    ranked_indexes = scores.argsort()[::-1]
    fallback_terms = []

    for index in ranked_indexes:
        term = feature_names[index]
        if _is_noise_term(term):
            continue
        fallback_terms.append(term)
        if len(fallback_terms) >= top_n:
            break

    return fallback_terms


def get_ranking_result(job_text: str, candidate_text: str, top_n: int = 10) -> Dict[str, object]:
    job_processed = preprocess(job_text)
    candidate_processed = preprocess(candidate_text)
    job_term_scores = _extract_relevant_term_scores(job_text)
    candidate_term_scores = _extract_relevant_term_scores(candidate_text)
    ranked_job_terms = _rank_terms(job_term_scores, top_n * 3)

    if not job_term_scores or not candidate_term_scores:
        return {
            "score": 0.0,
            "matched_keywords": [],
            "missing_keywords": [_display_term(term) for term in ranked_job_terms[:top_n]],
            "algorithm": ALGORITHM_NAME,
            "job_token_count": len(job_term_scores),
            "candidate_token_count": len(candidate_term_scores),
        }

    job_term_document = _term_document(job_term_scores)
    candidate_term_document = _term_document(candidate_term_scores)

    job_document = " ".join(filter(None, [job_processed, job_term_document]))
    candidate_document = " ".join(filter(None, [candidate_processed, candidate_term_document]))

    vectorizer = TfidfVectorizer(token_pattern=r"(?u)\b[a-zA-Z0-9_]+\b")
    vectors = vectorizer.fit_transform([job_document, candidate_document])
    score = cosine_similarity(vectors[0], vectors[1])[0][0]

    candidate_terms = set(candidate_term_scores.keys())
    matched_keywords = [
        _display_term(term) for term in ranked_job_terms if _term_matches_candidate(term, candidate_terms)
    ][:top_n]
    missing_keywords = [
        _display_term(term) for term in ranked_job_terms if not _term_matches_candidate(term, candidate_terms)
    ][:top_n]

    return {
        "score": round(float(score) * 100, 2),
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "algorithm": ALGORITHM_NAME,
        "job_token_count": len(job_term_scores),
        "candidate_token_count": len(candidate_term_scores),
    }


def get_match_score(job_text: str, candidate_text: str) -> float:
    result = get_ranking_result(job_text, candidate_text)
    return float(result["score"])


def extract_keywords_from_text(text: str, top_n: int = 15) -> List[str]:
    scores = _extract_relevant_term_scores(text)
    return [_display_term(term) for term in _rank_terms(scores, top_n)]
