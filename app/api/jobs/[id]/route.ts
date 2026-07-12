import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Job from '@/database/Job.model';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/apiResponse';
import { updateJobSchema } from '@/lib/validations/jobValidation';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_TOKEN);

async function getEmbedding(text: string) {
  if (!text.trim() || !process.env.HF_TOKEN) {
    return [];
  }

  try {
    const embedding = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
    });

    if (Array.isArray(embedding)) {
      return embedding as number[];
    }

    if (typeof embedding === 'object' && embedding !== null && 'data' in embedding) {
      const data = embedding as { data?: number[] };
      if (Array.isArray(data.data)) {
        return data.data;
      }
    }

    return [];
  } catch (error) {
    console.warn('[HF_JOB_EMBEDDING_WARN]', error);
    return [];
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initializeDatabase();

  const session = await getAuthSession();
  if (!session || session.accountType !== 'company' || session.role !== 'company') {
    return errorResponse('Unauthorized', 401);
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { value, error } = updateJobSchema.validate(body, { abortEarly: false, convert: true });

    if (error) {
      return validationErrorResponse(error);
    }

    const companyId = session.companyId || session.accountId;
    if (!companyId) {
      return errorResponse('Company ID not found in session', 400);
    }

    const job = await Job.findById(id);
    if (!job) {
      return errorResponse('Job not found', 404);
    }

    if (job.companyId?.toString() !== companyId.toString()) {
      return errorResponse('Unauthorized', 401);
    }

    const jobEmbedding = await getEmbedding(value.description);

    job.title = value.title;
    job.description = value.description;
    job.embedding = jobEmbedding;
    job.requiredSkills = value.requiredSkills;
    job.salaryRange = value.salaryRange || '';
    job.location = value.location;
    job.jobType = value.jobType;
    job.deadline = value.deadline;

    await job.save();

    return successResponse(
      { id: job._id, title: job.title },
      'Job updated successfully'
    );
  } catch (err) {
    console.error('[JOB_UPDATE_ERROR]', err);
    const message = err instanceof Error ? err.message : 'Failed to update job';
    return errorResponse(message, 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initializeDatabase();

  const session = await getAuthSession();
  if (!session || session.accountType !== 'company' || session.role !== 'company') {
    return errorResponse('Unauthorized', 401);
  }

  const { id } = await params;

  try {
    const companyId = session.companyId || session.accountId;
    if (!companyId) {
      return errorResponse('Company ID not found in session', 400);
    }

    const job = await Job.findById(id);
    if (!job) {
      return errorResponse('Job not found', 404);
    }

    if (job.companyId?.toString() !== companyId.toString()) {
      return errorResponse('Unauthorized', 401);
    }

    await Job.findByIdAndDelete(id);

    return successResponse(
      { id },
      'Job deleted successfully'
    );
  } catch (err) {
    console.error('[JOB_DELETE_ERROR]', err);
    const message = err instanceof Error ? err.message : 'Failed to delete job';
    return errorResponse(message, 500);
  }
}
