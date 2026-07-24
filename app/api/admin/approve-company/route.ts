import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Company from '@/database/Company.model';
import { getAuthSession } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/apiResponse';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();

    const session = await getAuthSession();
    if (!session || session.accountType !== 'admin' || session.role !== 'admin') {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json() as { companyId?: string; action?: 'approve' | 'reject' };
    const { companyId, action } = body;

    if (!companyId || !action) {
      return errorResponse('companyId and action are required', 400);
    }

    if (!['approve', 'reject'].includes(action)) {
      return errorResponse('Action must be "approve" or "reject"', 400);
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return errorResponse('Company not found', 404);
    }

    if (company.status === 'approved') {
      return errorResponse('Company is already approved', 400);
    }

    if (company.status === 'rejected') {
      return errorResponse('Company has already been rejected', 400);
    }

    company.status = action === 'approve' ? 'approved' : 'rejected';
    if (action === 'approve') {
      company.isVerified = true;
    }
    await company.save();

    return successResponse(
      {
        companyId: company._id,
        companyName: company.companyName,
        status: company.status,
      },
      `Company ${action === 'approve' ? 'approved' : 'rejected'} successfully.`
    );
  } catch (error) {
    console.error('[APPROVE_COMPANY_ERROR]', error);
    const message = error instanceof Error ? error.message : 'Failed to update company status';
    return errorResponse(message, 500);
  }
}
