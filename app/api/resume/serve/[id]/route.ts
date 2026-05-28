import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Resume from '@/database/Resume.model';
import { errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    await initializeDatabase();
    const session = await getAuthSession();
    if (!session || session.accountType !== 'candidate') {
      return errorResponse('Unauthorized', 401);
    }

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
    const resume = await Resume.findById(id).lean();
    if (!resume) {
      return errorResponse('Resume not found', 404);
    }

    const userId = session.userId ?? session.accountId;
    if (String(resume.userId) !== String(userId)) {
      return errorResponse('Forbidden', 403);
    }

    const fileUrl = resume.fileUrl;
    if (!fileUrl) {
      return errorResponse('File not available', 404);
    }

    const fetched = await fetch(fileUrl);
    if (!fetched.ok) {
      return errorResponse('Failed to fetch file', 502);
    }

    const contentType = fetched.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await fetched.arrayBuffer();

    return new Response(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${resume.originalName ?? 'resume'}"`,
      },
    });
  } catch (err) {
    console.error('[RESUME_SERVE_ERROR]', err);
    return errorResponse('Failed to serve resume', 500);
  }
}
