import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Resume from '@/database/Resume.model';
import { errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

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

    const filename = resume.originalName ?? 'resume.pdf';
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'pdf';
    const mimeMap: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      txt: 'text/plain',
      rtf: 'application/rtf',
    };
    const resolvedContentType = mimeMap[ext] || 'application/octet-stream';

    const download = new URL(request.url).searchParams.get('download') === '1';
    const disposition = download
      ? `attachment; filename="${filename}"`
      : 'inline';

    if (typeof fileUrl === 'string' && fileUrl.startsWith('/')) {
      const filePath = path.join(process.cwd(), 'public', fileUrl.replace(/^\/+/, ''));
      const fileBuffer = await fs.readFile(filePath).catch(() => null);
      if (!fileBuffer) {
        return errorResponse('File not available', 404);
      }
      const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
      return new Response(Buffer.from(arrayBuffer), {
        status: 200,
        headers: {
          'Content-Type': resolvedContentType,
          'Content-Disposition': disposition,
        },
      });
    }

    const fetched = await fetch(fileUrl);
    if (!fetched.ok) {
      return errorResponse('Failed to fetch file', 502);
    }
    const arrayBuffer = await fetched.arrayBuffer();

    return new Response(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        'Content-Type': resolvedContentType,
        'Content-Disposition': disposition,
      },
    });
  } catch (err) {
    console.error('[RESUME_SERVE_ERROR]', err);
    return errorResponse('Failed to serve resume', 500);
  }
}
