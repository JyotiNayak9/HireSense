import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Company from '@/database/Company.model';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/apiResponse';
import { validateUpdateCompany } from '@/lib/validations/companyValidation';

export async function PUT(request: NextRequest) {
  try {
    await initializeDatabase();

    const session = await getAuthSession();
    if (!session || session.accountType !== 'company' || session.role !== 'company') {
      return errorResponse('Unauthorized', 401);
    }

    const companyId = session.companyId || session.accountId;
    if (!companyId) {
      return errorResponse('Company ID not found in session', 400);
    }

    const body = await request.json();
    const { error, value } = validateUpdateCompany(body);

    if (error) {
      return validationErrorResponse(error);
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      {
        companyName: value.companyName,
        location: value.location,
        industry: value.industry,
        description: value.description || '',
      },
      { new: true, runValidators: true }
    ).select('companyName email location industry description');

    if (!company) {
      return errorResponse('Company not found', 404);
    }

    return successResponse(
      {
        companyName: company.companyName,
        email: company.email,
        location: company.location,
        industry: company.industry,
        description: company.description,
      },
      'Profile updated successfully'
    );
  } catch (err) {
    console.error('[COMPANY_PROFILE_UPDATE_ERROR]', err);
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    return errorResponse(message, 500);
  }
}
