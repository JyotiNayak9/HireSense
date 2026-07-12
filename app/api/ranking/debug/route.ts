import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Application from '@/database/Application.model';
import Job from '@/database/Job.model';
import Resume from '@/database/Resume.model';
import { successResponse, errorResponse } from '@/lib/apiResponse';
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
} from '@/lib/ranking/rankingService';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();

    const url = new URL(request.url);
    const applicationId = url.searchParams.get('applicationId');
    if (!applicationId) return errorResponse('applicationId query required', 400);

    const application = await Application.findById(applicationId).lean();
    if (!application) return errorResponse('Application not found', 404);

    const [job, resume] = await Promise.all([
      Job.findById(application.jobId).lean(),
      Resume.findById(application.resumeId).lean(),
    ]);

    if (!job || !resume) return errorResponse('Job or Resume not found', 404);

    // embeddings
    const jobEmbedding = (job as any)?.embedding || [];
    const resumeEmbedding = (resume as any)?.embedding || [];

    const similarity =
      Array.isArray(jobEmbedding) && Array.isArray(resumeEmbedding) && jobEmbedding.length > 0 && resumeEmbedding.length > 0
        ? similarityToPercentage(cosineSimilarity(jobEmbedding as number[], resumeEmbedding as number[]))
        : 0;

    const candidateSkills = Array.from(new Set([...(application.skills || []), ...(resume?.extractedSkills || [])]));
    const jobSkills = job.requiredSkills || [];

    const skillMatch = calculateSkillMatch(jobSkills, candidateSkills);

    const candidateYears = Number(application.experience) || extractYearsFromText(String(resume?.extractedExperience || application.experience || '')) || 0;
    const requiredYears = extractYearsFromText(String(job.description || ''));
    const experienceScore = calculateExperienceScore(candidateYears, requiredYears);

    const educationScore = calculateEducationScore(String(resume?.extractedEducation || ''));

    const projectCount = countProjectSections(String(resume?.parsedText || ''));
    const projectScore = calculateProjectScore(projectCount);

    const finalScore = calculateWeightedRankingScore({
      similarity,
      skillMatch,
      experienceScore,
      educationScore,
      projectScore,
    });

    const normalizedJobSkills = (jobSkills || []).map((s) => String(s).toLowerCase().trim()).filter(Boolean);
    const normalizedCandidateSkills = candidateSkills.map((s) => String(s).toLowerCase().trim()).filter(Boolean);
    const matchedKeywords = normalizedJobSkills.filter((s) => normalizedCandidateSkills.includes(s));
    const missingKeywords = normalizedJobSkills.filter((s) => !normalizedCandidateSkills.includes(s));

    return successResponse(
      {
        applicationId,
        finalScore,
        components: {
          similarity,
          skillMatch,
          experienceScore,
          educationScore,
          projectScore,
        },
        matchedKeywords,
        missingKeywords,
        jobEmbeddingLength: Array.isArray(jobEmbedding) ? jobEmbedding.length : 0,
        resumeEmbeddingLength: Array.isArray(resumeEmbedding) ? resumeEmbedding.length : 0,
        jobEmbeddingSample: Array.isArray(jobEmbedding) ? (jobEmbedding as any[]).slice(0, 8) : [],
        resumeEmbeddingSample: Array.isArray(resumeEmbedding) ? (resumeEmbedding as any[]).slice(0, 8) : [],
      },
      'Debug ranking for application'
    );
  } catch (err) {
    console.error('[RANKING_DEBUG_ERROR]', err);
    return errorResponse('Failed to compute debug ranking', 500);
  }
}
