import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Job from '@/database/Job.model';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/apiResponse';
import { createJobSchema } from '@/lib/validations/jobValidation';
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

export async function POST(request: NextRequest) {
  await initializeDatabase();

  const session = await getAuthSession();
  if (!session || session.accountType !== 'company' || session.role !== 'company') {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const body = await request.json();
    const { value, error } = createJobSchema.validate(body, { abortEarly: false, convert: true });

    if (error) {
      return validationErrorResponse(error);
    }

    const companyId = session.companyId || session.accountId;
    if (!companyId) {
      console.error('[JOB_CREATE_ERROR] No companyId found in session:', session);
      return errorResponse('Company ID not found in session', 400);
    }

    const jobEmbedding = await getEmbedding(value.description);

    const job = await Job.create({
      title: value.title,
      description: value.description,
      embedding: jobEmbedding,
      requiredSkills: value.requiredSkills,
      salaryRange: value.salaryRange || '',
      location: value.location,
      jobType: value.jobType,
      deadline: value.deadline,
      companyId: companyId as any,
    });

    return successResponse(
      { id: job._id, title: job.title },
      'Job posted successfully',
      201
    );
  } catch (err) {
    console.error('[JOB_CREATE_ERROR]', err);
    const message = err instanceof Error ? err.message : 'Failed to create job';
    return errorResponse(message, 500);
  }
}
