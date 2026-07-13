import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Company from '@/database/Company.model';
import Job from '@/database/Job.model';
import Application from '@/database/Application.model';
import RankingResult from '@/database/RankingResult.model';
import { getAuthSession } from '@/lib/auth';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/apiResponse';
import { validateCreateCompany } from '@/lib/validations/companyValidation';
import {
  generateOTP,
  storeOTP,
  sendOTPEmail,
} from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();

    const formData = await request.formData();
    const body: Record<string, FormDataEntryValue> = {};

    formData.forEach((value, key) => {
      body[key] = value;
    });

    const { error, value } = validateCreateCompany(body);

    if (error) {
      return validationErrorResponse(error);
    }

    const existingCompany = await Company.findOne({ email: value.email });

    if (existingCompany) {
      return errorResponse('Company with this email already exists', 409);
    }

    const company = await Company.create({
      companyName: value.companyName,
      email: value.email,
      password: value.password,
      location: value.location,
      industry: value.industry,
      description: value.description || undefined,
    });

    const otp = generateOTP();
    await storeOTP(company.email, otp);
    await sendOTPEmail(company.email, company.companyName, otp);

    return successResponse(
      {
        companyId: company._id,
        email: company.email,
        companyName: company.companyName,
      },
      'Company registered successfully. Please verify your email with the OTP sent to your inbox.',
      201
    );
  } catch (error) {
    console.error('[COMPANY_CREATE_ERROR]', error);
    const message = error instanceof Error ? error.message : 'Failed to register company';
    return errorResponse(message, 500);
  }
}

export async function DELETE() {
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

    const company = await Company.findById(companyId);
    if (!company) {
      return errorResponse('Company not found', 404);
    }

    const jobs = await Job.find({ companyId: companyId as any }).select('_id').lean();
    const jobIds = jobs.map(job => job._id);

    if (jobIds.length > 0) {
      await RankingResult.deleteMany({ jobId: { $in: jobIds } });
      await Application.deleteMany({ jobId: { $in: jobIds } });
      await Job.deleteMany({ _id: { $in: jobIds } });
    }

    await Company.findByIdAndDelete(companyId);

    return successResponse(null, 'Company and associated data deleted successfully');
  } catch (error) {
    console.error('[COMPANY_DELETE_ERROR]', error);
    const message = error instanceof Error ? error.message : 'Failed to delete company';
    return errorResponse(message, 500);
  }
}
