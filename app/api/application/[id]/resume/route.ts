import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Application from '@/database/Application.model';
import Job from '@/database/Job.model';
import Resume from '@/database/Resume.model';
import { errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';

export async function GET(request: NextRequest, context: any) {
  try {
    await initializeDatabase();
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const maybeParams = context?.params;
    const resolvedParams = typeof maybeParams?.then === 'function' ? await maybeParams : maybeParams;
    const applicationId = resolvedParams?.id;
    if (!applicationId) return errorResponse('Missing application id', 400);

    const application = await Application.findById(applicationId);
    if (!application) return errorResponse('Application not found', 404);

    let isAuthorized = false;

    if (session.accountType === 'candidate') {
      const userId = session.userId ?? session.accountId;
      isAuthorized = String(application.userId) === String(userId);
    }

    if (session.accountType === 'company') {
      const job = await Job.findById(application.jobId).select('companyId');
      if (job) {
        const companyId = session.companyId || session.accountId;
        isAuthorized = String(job.companyId) === String(companyId);
      }
    }

    if (!isAuthorized) return errorResponse('Forbidden', 403);

    const resume = await Resume.findById(application.resumeId).lean();
    if (!resume) return errorResponse('Resume not found', 404);

    const fileUrl = resume.fileUrl;
    if (!fileUrl) return errorResponse('File not available', 404);

    const download = new URL(request.url).searchParams.get('download') === '1';
    const fetched = await fetch(fileUrl);
    if (!fetched.ok) return errorResponse('Failed to fetch file', 502);

    const arrayBuffer = await fetched.arrayBuffer();

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
    const contentType = mimeMap[ext] || fetched.headers.get('content-type') || 'application/octet-stream';
    const disposition = download
      ? `attachment; filename="${filename}"`
      : 'inline';

    return new Response(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
      },
    });
  } catch (err) {
    console.error('[APPLICATION_RESUME_SERVE_ERROR]', err);
    return errorResponse('Failed to serve resume', 500);
  }
}
