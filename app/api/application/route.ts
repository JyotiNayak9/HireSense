import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Application from '@/database/Application.model';
import Resume from '@/database/Resume.model';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const session = await getAuthSession();
    if (!session || session.accountType !== 'candidate') return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { jobId, resumeId, name, email, phone, skills, experience } = body;
    if (!jobId || !resumeId || !name || !email || !phone || !experience) {
      return errorResponse('Missing required fields', 400);
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) return errorResponse('Resume not found', 404);

    const userId = session.userId as any ?? session.accountId;
    if (String(resume.userId) !== String(userId)) return errorResponse('Forbidden', 403);

    const application = await Application.create({
      userId,
      jobId,
      resumeId,
      name,
      email,
      phone,
      skills: Array.isArray(skills) ? skills : [],
      experience,
      applicationDate: new Date(),
      status: 'pending',
      matchPercentage: 0,
    });

    return successResponse(application, 'Application created', 201);
  } catch (err) {
    console.error('[APPLICATION_POST_ERROR]', err);
    return errorResponse('Failed to create application', 500);
  }
}
