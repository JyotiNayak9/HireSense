import Application from '@/database/Application.model';
import Job from '@/database/Job.model';
import RankingResult from '@/database/RankingResult.model';
import Resume from '@/database/Resume.model';
import { buildCandidateRankingText, buildJobRankingText } from '@/lib/ranking/textBuilders';
import {
  cosineSimilarity,
  similarityToPercentage,
  calculateSkillMatch,
  extractYearsFromText,
  calculateExperienceScore,
  calculateEducationScore,
  countProjectSections,
  calculateProjectScore,
  calculateWeightedRankingScore,
} from './rankingService';
import { refreshJobRecommendationRanks } from '@/lib/ranking/recommendations';

type LeanApplication = {
  _id: unknown;
  userId: unknown;
  jobId: unknown;
  resumeId: unknown;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  skills?: string[];
  experience?: string | null;
};

type LeanJob = {
  _id: unknown;
  title?: string | null;
  description?: string | null;
  requiredSkills?: string[] | null;
  jobType?: string | null;
  location?: string | null;
  salaryRange?: string | null;
};

type LeanResume = {
  _id: unknown;
  fileUrl?: string | null;
  originalName?: string | null;
  parsedText?: string | null;
  parseStatus?: 'pending' | 'completed' | 'failed';
  parseError?: string | null;
  extractedSkills?: string[] | null;
  extractedEducation?: string | null;
  extractedExperience?: string | null;
};

export type ApplicationRankingResult = {
  applicationId: string;
  score: number;
  ranked: boolean;
  parsedResume: boolean;
  matchedKeywords: string[];
  missingKeywords: string[];
  error?: string;
};

async function ensureResumeText(resume: LeanResume) {
  if (resume.parsedText?.trim()) {
    return { resume, parsedResume: false };
  }

  return {
    resume,
    parsedResume: false,
    error: 'Resume parsing was not completed locally',
  };
}

export async function recalculateApplicationRanking(applicationId: string): Promise<ApplicationRankingResult> {
  const application = await Application.findById(applicationId).lean<LeanApplication>();
  if (!application) {
    return {
      applicationId,
      score: 0,
      ranked: false,
      parsedResume: false,
      matchedKeywords: [],
      missingKeywords: [],
      error: 'Application not found',
    };
  }

  const [job, resume] = await Promise.all([
    Job.findById(application.jobId).lean<LeanJob>(),
    Resume.findById(application.resumeId).lean<LeanResume>(),
  ]);

  if (!job || !resume) {
    return {
      applicationId,
      score: 0,
      ranked: false,
      parsedResume: false,
      matchedKeywords: [],
      missingKeywords: [],
      error: !job ? 'Job not found' : 'Resume not found',
    };
  }

  const resumeText = await ensureResumeText(resume);
  const jobText = buildJobRankingText(job);
  const candidateText = buildCandidateRankingText({
    resume: resumeText.resume,
    formData: {
      name: application.name || null,
      email: application.email || null,
      phone: application.phone || null,
      skills: application.skills || [],
      experience: application.experience || '',
    },
    skills: application.skills || [],
    experience: application.experience || '',
  });

  // Compute feature scores locally
  const jobEmbedding = (job as any)?.embedding || [];
  const resumeEmbedding = (resumeText.resume as any)?.embedding || [];

  const similarity =
    Array.isArray(jobEmbedding) && Array.isArray(resumeEmbedding) && jobEmbedding.length > 0 && resumeEmbedding.length > 0
      ? similarityToPercentage(cosineSimilarity(jobEmbedding as number[], resumeEmbedding as number[]))
      : 0;

  const candidateSkills = Array.from(new Set([...(application.skills || []), ...(resumeText.resume?.extractedSkills || [])]));
  const jobSkills = job.requiredSkills || [];

  const skillMatch = calculateSkillMatch(jobSkills, candidateSkills);

  const candidateYears = Number(application.experience) || extractYearsFromText(String(resumeText.resume?.extractedExperience || application.experience || '')) || 0;
  const requiredYears = extractYearsFromText(String(job.description || ''));
  const experienceScore = calculateExperienceScore(candidateYears, requiredYears);

  const educationScore = calculateEducationScore(String(resumeText.resume?.extractedEducation || ''));

  const projectCount = countProjectSections(String(resumeText.resume?.parsedText || ''));
  const projectScore = calculateProjectScore(projectCount);

  const finalScore = calculateWeightedRankingScore({
    similarity,
    skillMatch,
    experienceScore,
    educationScore,
    projectScore,
  });

  // matched / missing keywords are derived from skills
  const normalizedJobSkills = (jobSkills || []).map((s) => String(s).toLowerCase().trim()).filter(Boolean);
  const normalizedCandidateSkills = candidateSkills.map((s) => String(s).toLowerCase().trim()).filter(Boolean);
  const matchedKeywords = normalizedJobSkills.filter((s) => normalizedCandidateSkills.includes(s));
  const missingKeywords = normalizedJobSkills.filter((s) => !normalizedCandidateSkills.includes(s));

  const algorithmName = 'local_weighted_v1';

  await Application.findByIdAndUpdate(application._id, {
    $set: {
      matchPercentage: finalScore,
      matchedKeywords,
      missingKeywords,
      rankingEngine: algorithmName,
      rankingCalculatedAt: new Date(),
    },
  });

  await RankingResult.findOneAndUpdate(
    { applicationId: String(application._id) },
    {
      $set: {
        jobId: String(application.jobId),
        applicationId: String(application._id),
        userId: String(application.userId),
        resumeId: String(application.resumeId),
        score: finalScore,
        matchedKeywords,
        missingKeywords,
        algorithm: algorithmName,
        jobTokenCount: 0,
        candidateTokenCount: 0,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await refreshJobRecommendationRanks(String(application.jobId));

  return {
    applicationId: String(application._id),
    score: finalScore,
    ranked: true,
    parsedResume: resumeText.parsedResume,
    matchedKeywords,
    missingKeywords,
  };
}

export async function recalculateJobRankings(jobId: string) {
  const applications = await Application.find({ jobId }).select('_id').sort({ createdAt: 1 }).lean<Array<{ _id: unknown }>>();
  const results: ApplicationRankingResult[] = [];

  for (const application of applications) {
    results.push(await recalculateApplicationRanking(String(application._id)));
  }

  return {
    total: results.length,
    ranked: results.filter((result) => result.ranked).length,
    failed: results.filter((result) => !result.ranked).length,
    results,
  };
}
