import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Resume from '@/database/Resume.model';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    await initializeDatabase();
    const session = await getAuthSession();
    if (!session || session.accountType !== 'candidate') {
      return errorResponse('Unauthorized', 401);
    }

    // params can be a Promise in Next.js dynamic API routes — await it
    const maybeParams = context?.params;
    const resolvedParams = typeof maybeParams?.then === 'function' ? await maybeParams : maybeParams;
    const id = resolvedParams?.id ?? (() => {
      try {
        const url = new URL(request.url);
        const parts = url.pathname.split('/').filter(Boolean);
        return parts[parts.length - 1];
      } catch {
        return undefined as any;
      }
    })();
    if (!id) return errorResponse('Missing resume id', 400);
    const resume = await Resume.findById(id);
    if (!resume) {
      return errorResponse('Resume not found', 404);
    }

    const userId = session.userId ?? session.accountId;
    if (String(resume.userId) !== String(userId)) {
      return errorResponse('Forbidden', 403);
    }

    // Remove file from Cloudinary if publicId exists, otherwise attempt local delete
    try {
      if ((resume as any).publicId) {
        await cloudinary.uploader.destroy((resume as any).publicId, { resource_type: 'auto' });
      } else {
        const fileUrl = resume.fileUrl;
        if (typeof fileUrl === 'string' && fileUrl.startsWith('/')) {
          const filePath = path.join(process.cwd(), 'public', fileUrl.replace(/^\/+/, ''));
          await fs.unlink(filePath).catch(() => {});
        } else if (fileUrl) {
          try {
            const url = new URL(fileUrl);
            const filename = path.basename(url.pathname);
            const filePath = path.join(process.cwd(), 'public', 'uploads', 'resumes', filename);
            await fs.unlink(filePath).catch(() => {});
          } catch {
            // ignore invalid URL values
          }
        }
      }
    } catch (e) {
      console.warn('[RESUME_DELETE_FILE_WARN]', e);
    }

    await Resume.findByIdAndDelete(id);

    return successResponse({}, 'Resume deleted');
  } catch (err) {
    console.error('[RESUME_DELETE_ERROR]', err);
    return errorResponse('Failed to delete resume', 500);
  }
}
