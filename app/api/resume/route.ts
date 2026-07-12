import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Resume from '@/database/Resume.model';
import User from '@/database/User.model';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import { HfInference } from '@huggingface/inference';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';
import { extractSkills, extractYearsFromText, extractEducationLabel } from '@/lib/ranking/rankingService';
import Application from '@/database/Application.model';
import { recalculateApplicationRanking } from '@/lib/ranking/applicationRanking';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type UploadedResumeFile = Blob & {
  name: string;
  type: string;
  size: number;
};

const hf = new HfInference(process.env.HF_TOKEN);

function preprocessText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

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
    console.warn('[HF_EMBEDDING_WARN]', error);
    return [];
  }
}

function isUploadedResumeFile(file: unknown): file is UploadedResumeFile {
  return (
    typeof file === 'object' &&
    file !== null &&
    'name' in file &&
    'type' in file &&
    'size' in file &&
    'arrayBuffer' in file
  );
}

async function extractTextFromUploadedPdf(file: UploadedResumeFile, buffer: Buffer) {
  const ext = path.extname(file.name || '').toLowerCase();
  const isPdf = file.type === 'application/pdf' || ext === '.pdf';

  if (!isPdf) {
    return null;
  }

  try {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const data = await parser.getText();
    const text = data.text?.trim() || '';

    return {
      text,
      keywords: [],
      status: (text ? 'completed' : 'failed') as 'completed' | 'failed',
      error: text ? undefined : 'No text could be extracted from this PDF',
    };
  } catch (error) {
    console.error('[PDF_PARSE_ERROR]', error);
    return {
      text: '',
      keywords: [],
      status: 'failed' as const,
      error: error instanceof Error ? error.message : 'Failed to parse PDF',
    };
  }
}

async function extractTextFromUploadedDocx(file: UploadedResumeFile, buffer: Buffer) {
  const ext = path.extname(file.name || '').toLowerCase();
  const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === '.docx';

  if (!isDocx) {
    return null;
  }

  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = String(result.value || '').trim();

    return {
      text,
      keywords: [],
      status: (text ? 'completed' : 'failed') as 'completed' | 'failed',
      error: text ? undefined : 'No text could be extracted from this DOCX',
    };
  } catch (error) {
    console.error('[DOCX_PARSE_ERROR]', error);
    return {
      text: '',
      keywords: [],
      status: 'failed' as const,
      error: error instanceof Error ? error.message : 'Failed to parse DOCX',
    };
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    await initializeDatabase();
    const session = await getAuthSession();
    if (!session || session.accountType !== 'candidate') {
      return errorResponse('Unauthorized', 401);
    }

    const userId = session.userId ?? session.accountId;
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 }).lean();

    return successResponse(resumes, 'Resumes fetched');
  } catch (err) {
    console.error('[RESUME_GET_ERROR]', err);
    return errorResponse('Failed to fetch resumes', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const session = await getAuthSession();
    if (!session || session.accountType !== 'candidate') {
      return errorResponse('Unauthorized', 401);
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!isUploadedResumeFile(file)) {
      return errorResponse('No file provided', 400);
    }

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const ext = path.extname(file.name || '').toLowerCase();
    const allowedExt = ['.pdf', '.docx'];

    if (!allowedTypes.includes(file.type) && !allowedExt.includes(ext)) {
      return errorResponse('Resume must be a PDF or DOCX file', 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse('File too large', 400);
    }

    // Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'raw',
      folder: 'hiresense/resumes',
    });

    const fileUrl = uploadResult.secure_url;
    const publicId = uploadResult.public_id;

    const userId = session.userId ?? session.accountId;
    const pdfExtraction = await extractTextFromUploadedPdf(file, buffer);
    const extraction = pdfExtraction ?? (await extractTextFromUploadedDocx(file, buffer));

    if (!extraction) {
      return errorResponse('Failed to parse resume file', 500);
    }

    const cleanedText = preprocessText(extraction.text || '');
    const embedding = await getEmbedding(cleanedText || extraction.text || file.name);
    const extractedSkillsFromText = extractSkills(cleanedText || extraction.text || '');
    const extractedEducationFromText = extractEducationLabel(cleanedText || extraction.text || '');
    const extractedExperienceFromText = String(extractYearsFromText(cleanedText || extraction.text || '') || '');

    const resume = await Resume.create({
      userId,
      candidateId: userId,
      fileUrl,
      publicId,
      originalName: file.name,
      parsedText: extraction.text,
      resumeText: extraction.text,
      cleanedText,
      embedding,
      parseStatus: extraction.status,
      parseError: extraction.error || null,
      parsedAt: extraction.status === 'completed' ? new Date() : null,
      extractedSkills: extractedSkillsFromText.length ? extractedSkillsFromText : extraction.keywords,
      extractedEducation: extractedEducationFromText || '',
      extractedExperience: extractedExperienceFromText || '',
      aiScore: 0,
    });

    // Optionally link resumeId to user (non-destructive: leave existing resumeId as-is)
    await User.findByIdAndUpdate(userId, { $set: { /* no-op */ } });

    // Recalculate rankings for any applications that reference this resume
    try {
      const apps = await Application.find({ resumeId: resume._id }).select('_id').lean();
      for (const app of apps) {
        // fire-and-forget but await to keep operations predictable during upload
        // eslint-disable-next-line no-await-in-loop
        await recalculateApplicationRanking(String(app._id));
      }
    } catch (recalcErr) {
      console.warn('[RESUME_RECALC_WARN]', recalcErr);
    }

    return successResponse(resume, 'Resume uploaded', 201);
  } catch (err) {
    console.error('[RESUME_UPLOAD_ERROR]', err);
    return errorResponse('Failed to upload resume', 500);
  }
}
