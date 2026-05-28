import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Resume from '@/database/Resume.model';
import User from '@/database/User.model';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const session = await getAuthSession();
    if (!session || session.accountType !== 'candidate') {
      return errorResponse('Unauthorized', 401);
    }

    const userId  = session.userId as any ?? session.accountId;
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
    const file = formData.get('file') as unknown;

    if (!file || typeof file !== 'object' || !(file as any).name) {
      return errorResponse('No file provided', 400);
    }

    const f: any = file;
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const ext = path.extname(f.name || '').toLowerCase();
    const allowedExt = ['.pdf', '.docx'];

    if (!allowedTypes.includes(f.type) && !allowedExt.includes(ext)) {
      return errorResponse('Resume must be a PDF or DOCX file', 400);
    }

    if (f.size > MAX_FILE_SIZE) {
      return errorResponse('File too large', 400);
    }

    // Upload to Cloudinary
    const buffer = Buffer.from(await f.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUri = `data:${f.type};base64,${base64}`;

    const uploadResult: any = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'raw',
      folder: 'hiresense/resumes',
    });

    const fileUrl = uploadResult.secure_url;
    const publicId = uploadResult.public_id;

    const userId = session.userId as any ?? session.accountId;

    const resume = await Resume.create({
      userId,
      fileUrl,
      publicId,
      originalName: f.name,
      extractedSkills: [],
      extractedEducation: '',
      extractedExperience: '',
      aiScore: 0,
    });

    // Optionally link resumeId to user (non-destructive: leave existing resumeId as-is)
    await User.findByIdAndUpdate(userId, { $set: { /* no-op */ } });

    return successResponse(resume, 'Resume uploaded', 201);
  } catch (err) {
    console.error('[RESUME_UPLOAD_ERROR]', err);
    return errorResponse('Failed to upload resume', 500);
  }
}
