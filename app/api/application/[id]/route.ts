import { NextRequest, NextResponse } from 'next/server';
import { requireCompanySession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Application from '@/database/Application.model';
import Job from '@/database/Job.model';

const VALID_STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await requireCompanySession();
    await initializeDatabase();

    const companyId = session.companyId || session.accountId;
    if (!companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const application = await Application.findById(id).select('jobId').lean();
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const job = await Job.findById(application.jobId).select('companyId').lean();
    if (!job || String(job.companyId) !== String(companyId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ application: updated });
  } catch (error) {
    console.error('[PATCH_APPLICATION_STATUS_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
