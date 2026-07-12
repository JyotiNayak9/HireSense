import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Application from '@/database/Application.model';
import Resume from '@/database/Resume.model';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';
import { recalculateApplicationRanking } from '@/lib/ranking/applicationRanking';

type ApplicationRequestBody = {
  jobId: string;
  resumeId: string;
  name: string;
  email: string;
  phone: string;
  skills?: unknown;
  experience: string;
};

function isDuplicateKeyError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const session = await getAuthSession();
    if (!session || session.accountType !== 'candidate') return errorResponse('Unauthorized', 401);

    const body = (await request.json()) as Partial<ApplicationRequestBody>;
    const { jobId, resumeId, name, email, phone, skills, experience } = body;
    if (!jobId || !resumeId || !name || !email || !phone || !experience) {
      return errorResponse('Missing required fields', 400);
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) return errorResponse('Resume not found', 404);

    const userId = session.userId ?? session.accountId;
    if (String(resume.userId) !== String(userId)) return errorResponse('Forbidden', 403);

    const normalizedSkills = Array.isArray(skills)
      ? skills.filter((skill): skill is string => typeof skill === 'string' && Boolean(skill.trim())).map((skill) => skill.trim())
      : [];

    const application = await Application.create({
      userId,
      jobId,
      resumeId,
      name,
      email,
      phone,
      skills: normalizedSkills,
      experience,
      applicationDate: new Date(),
      status: 'pending',
      matchPercentage: 0,
      matchedKeywords: [],
      missingKeywords: [],
      rankingEngine: '',
      rankingCalculatedAt: null,
    });
    const applicationId = String(application._id);

    try {
      await recalculateApplicationRanking(applicationId);
    } catch (rankingPersistenceError) {
      console.warn('[RANKING_RESULT_SAVE_WARN]', rankingPersistenceError);
    }

    return successResponse(application, 'Application created', 201);
  } catch (err) {
    console.error('[APPLICATION_POST_ERROR]', err);
    if (isDuplicateKeyError(err)) {
      return errorResponse('You have already applied for this job', 409);
    }
    return errorResponse('Failed to create application', 500);
  }
}
