export type RankingServiceResult = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  algorithm: string;
  jobTokenCount: number;
  candidateTokenCount: number;
  available: boolean;
  error?: string;
};

export type ResumeExtractionResult = {
  text: string;
  keywords: string[];
  status: 'completed' | 'failed';
  error?: string;
};

function clampScore(score: unknown) {
  const numberScore = typeof score === 'number' && Number.isFinite(score) ? score : 0;
  return Math.min(100, Math.max(0, Number(Number(numberScore).toFixed(2))));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    const valueA = Number(a[i]) || 0;
    const valueB = Number(b[i]) || 0;

    dotProduct += valueA * valueB;
    normA += valueA * valueA;
    normB += valueB * valueB;
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function similarityToPercentage(similarity: number): number {
  if (!Number.isFinite(similarity)) return 0;
  return Number(Math.max(0, Math.min(100, similarity * 100)).toFixed(2));
}

const SKILL_DICTIONARY = [
  'react',
  'nextjs',
  'nodejs',
  'mongodb',
  'express',
  'typescript',
  'docker',
  'aws',
];

export function extractSkills(text: string): string[] {
  const normalized = (text || '').toLowerCase();
  return SKILL_DICTIONARY.filter((s) => normalized.includes(s));
}

export function calculateSkillMatch(jobSkills: string[], candidateSkills: string[]): number {
  if (!Array.isArray(jobSkills) || jobSkills.length === 0) return 0;
  const normJob = jobSkills.map((s) => String(s).toLowerCase().trim()).filter(Boolean);
  const normCand = Array.isArray(candidateSkills)
    ? candidateSkills.map((s) => String(s).toLowerCase().trim()).filter(Boolean)
    : [];
  const matched = normJob.filter((s) => normCand.includes(s));
  const pct = (matched.length / normJob.length) * 100;
  return Number(pct.toFixed(2));
}

export function calculateExperienceScore(candidateYears: number, requiredYears: number): number {
  if (!Number.isFinite(candidateYears)) return 0;
  if (!Number.isFinite(requiredYears) || requiredYears <= 0) return 100;
  if (candidateYears >= requiredYears) return 100;
  return Number(((candidateYears / requiredYears) * 100).toFixed(2));
}

export function extractYearsFromText(text: string): number {
  if (!text || !text.trim()) return 0;
  const normalized = text.toLowerCase();
  const match = normalized.match(/(\d+(?:\.\d+)?)(?:\s*-\s*\d+(?:\.\d+)?)?\s*(?:\+)?\s*(?:years?|yrs?)/i);
  if (match && match[1]) {
    const n = Number(match[1]);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

export function extractEducationLabel(text: string): string {
  const normalized = (text || '').toLowerCase();
  if (/phd|doctorate/.test(normalized)) return 'PhD';
  if (/master|msc|mtech/.test(normalized)) return 'Masters';
  if (/bachelor|bca|bsc|be|btech|bs/.test(normalized)) return 'Bachelors';
  if (/diploma|certificate/.test(normalized)) return 'Diploma';
  return '';
}

export function countProjectSections(text: string): number {
  if (!text || !text.trim()) return 0;
  const normalized = text.toLowerCase();
  const matches = normalized.match(/\bprojects?\b/g);
  if (matches && matches.length > 0) return matches.length;
  const alt = normalized.match(/project[:\-]/g);
  return alt ? alt.length : 0;
}

const EDUCATION_WEIGHT = {
  phd: 100,
  masters: 90,
  bachelors: 80,
  diploma: 60,
} as const;

export function calculateEducationScore(educationText: string): number {
  const normalized = (educationText || '').toLowerCase();
  if (/phd|doctorate/.test(normalized)) return EDUCATION_WEIGHT.phd;
  if (/master|msc|mtech/.test(normalized)) return EDUCATION_WEIGHT.masters;
  if (/bachelor|bca|bsc|be|btech|bs/.test(normalized)) return EDUCATION_WEIGHT.bachelors;
  if (/diploma|certificate/.test(normalized)) return EDUCATION_WEIGHT.diploma;
  return 0;
}

export function calculateProjectScore(numberOfRelevantProjects: number): number {
  if (!Number.isFinite(numberOfRelevantProjects) || numberOfRelevantProjects <= 0) return 0;
  const score = (numberOfRelevantProjects / 5) * 100;
  return Math.min(100, Number(score.toFixed(2)));
}

export function calculateWeightedRankingScore({
  similarity,
  skillMatch,
  experienceScore,
  educationScore,
  projectScore,
}: {
  similarity: number;
  skillMatch: number;
  experienceScore: number;
  educationScore: number;
  projectScore: number;
}): number {
  const finalScore =
    similarity * 0.4 + skillMatch * 0.3 + experienceScore * 0.15 + educationScore * 0.1 + projectScore * 0.05;
  return Number(finalScore.toFixed(2));
}

export function rankCandidates<T extends { finalScore?: number }>(candidates: T[]): T[] {
  return [...candidates].sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
}

export function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((i): i is string => typeof i === 'string') : [];
}
