import RankingResult from '@/database/RankingResult.model';
import Resume from '@/database/Resume.model';
import Job from '@/database/Job.model';
import Application from '@/database/Application.model';
import {
  cosineSimilarity,
  similarityToPercentage,
  calculateSkillMatch,
  extractYearsFromText,
  calculateExperienceScore,
  calculateEducationScore,
  calculateWeightedRankingScore,
} from './rankingService';

export async function refreshJobRecommendationRanks(jobId: string) {
  const results = await RankingResult.find({ jobId }).sort({ score: -1, createdAt: 1 });

  if (results.length === 0) {
    return 0;
  }

  await RankingResult.bulkWrite(
    results.map((result, index) => ({
      updateOne: {
        filter: { _id: result._id },
        update: {
          $set: {
            rank: index + 1,
            isRecommended: index < 3,
          },
        },
      },
    }))
  );

  return results.length;
}

export type JobRecommendation = {
  jobId: string;
  title: string;
  description: string;
  requiredSkills: string[];
  salaryRange?: string;
  jobType: string;
  location: string;
  deadline: Date;
  createdAt: Date;
  companyName?: string;
  companyLogo?: string;
  matchScore: number;
  skillMatch: number;
  matchedSkills: string[];
  missingSkills: string[];
};

export async function getRecommendedJobsForCandidate(
  userId: string
): Promise<JobRecommendation[]> {
  const resume = await Resume.findOne({ userId })
    .select('extractedSkills extractedEducation extractedExperience embedding parsedText')
    .sort({ createdAt: -1 })
    .lean<{
      extractedSkills?: string[];
      extractedEducation?: string;
      extractedExperience?: string;
      embedding?: number[];
      parsedText?: string;
    }>();

  const now = new Date();
  const allJobs = await Job.find({ deadline: { $gte: now } })
    .populate('companyId', 'companyName logo')
    .sort({ createdAt: -1 })
    .lean();

  if (!allJobs.length) return [];

  const appliedJobIds = await Application.find({ userId }).distinct('jobId');
  const appliedSet = new Set(appliedJobIds.map((id) => id.toString()));

  const candidateSkills = resume?.extractedSkills || [];
  const candidateEmbedding = resume?.embedding || [];
  const candidateExperience = resume?.extractedExperience || '';
  const candidateEducation = resume?.extractedEducation || '';

  const scored: JobRecommendation[] = [];

  for (const job of allJobs) {
    if (appliedSet.has(job._id.toString())) continue;

    const jobSkills = job.requiredSkills || [];
    const jobEmbedding = (job as any)?.embedding || [];

    const skillMatch = calculateSkillMatch(jobSkills, candidateSkills);

    const similarity =
      Array.isArray(jobEmbedding) && jobEmbedding.length > 0 &&
      Array.isArray(candidateEmbedding) && candidateEmbedding.length > 0
        ? similarityToPercentage(cosineSimilarity(jobEmbedding as number[], candidateEmbedding as number[]))
        : 0;

    const candidateYears = extractYearsFromText(candidateExperience);
    const requiredYears = extractYearsFromText(job.description || '');
    const experienceScore = calculateExperienceScore(candidateYears, requiredYears);

    const educationScore = calculateEducationScore(candidateEducation);

    const finalScore = calculateWeightedRankingScore({
      similarity,
      skillMatch,
      experienceScore,
      educationScore,
      projectScore: 0,
    });

    const normJobSkills = jobSkills.map((s: string) => String(s).toLowerCase().trim()).filter(Boolean);
    const normCandSkills = candidateSkills.map((s) => String(s).toLowerCase().trim()).filter(Boolean);
    const matchedSkills = normJobSkills.filter((s: string) => normCandSkills.includes(s));
    const missingSkills = normJobSkills.filter((s: string) => !normCandSkills.includes(s));

    const company = job.companyId as unknown as { companyName?: string; logo?: string } | null;

    scored.push({
      jobId: job._id.toString(),
      title: job.title,
      description: job.description,
      requiredSkills: jobSkills,
      salaryRange: job.salaryRange,
      jobType: job.jobType,
      location: job.location,
      deadline: job.deadline,
      createdAt: job.createdAt,
      companyName: company?.companyName || 'Unknown',
      companyLogo: company?.logo,
      matchScore: finalScore,
      skillMatch,
      matchedSkills,
      missingSkills,
    });
  }

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}
