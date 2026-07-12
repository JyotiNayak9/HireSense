import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import { errorResponse, successResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';
import Application from '@/database/Application.model';
import Job from '@/database/Job.model';
import { recalculateApplicationRanking, recalculateJobRankings } from '@/lib/ranking/applicationRanking';

type RecalculateRequestBody = {
  jobId?: string;
  applicationId?: string;
};

type LeanJobOwner = {
  _id: unknown;
  companyId: unknown;
};

type LeanApplicationOwner = {
  _id: unknown;
  jobId: unknown;
};

async function findAuthorizedJob(jobId: string, companyId: string) {
  const job = await Job.findById(jobId).select('companyId').lean<LeanJobOwner>();
  if (!job) return { error: errorResponse('Job not found', 404) };
  if (String(job.companyId) !== String(companyId)) return { error: errorResponse('Forbidden', 403) };
  return { job };
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();

    const session = await getAuthSession();
    if (!session || session.accountType !== 'company' || session.role !== 'company') {
      return errorResponse('Unauthorized', 401);
    }

    const companyId = session.companyId || session.accountId;
    if (!companyId) return errorResponse('Company ID not found in session', 400);

    const body = (await request.json()) as RecalculateRequestBody;

    if (body.applicationId) {
      const application = await Application.findById(body.applicationId).select('jobId').lean<LeanApplicationOwner>();
      if (!application) return errorResponse('Application not found', 404);

      const authorizedJob = await findAuthorizedJob(String(application.jobId), companyId);
      if (authorizedJob.error) return authorizedJob.error;

      const result = await recalculateApplicationRanking(body.applicationId);
      return successResponse(result, result.ranked ? 'Application ranking recalculated' : 'Ranking could not be recalculated');
    }

    if (body.jobId) {
      const authorizedJob = await findAuthorizedJob(body.jobId, companyId);
      if (authorizedJob.error) return authorizedJob.error;

      const result = await recalculateJobRankings(body.jobId);
      return successResponse(result, 'Job rankings recalculated');
    }

    return errorResponse('Provide jobId or applicationId', 400);
  } catch (error) {
    console.error('[RANKING_RECALCULATE_ERROR]', error);
    return errorResponse('Failed to recalculate rankings', 500);
  }
}
