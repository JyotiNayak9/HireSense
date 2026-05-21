import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Company from '@/database/Company.model';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/apiResponse';
import { validateCreateCompany } from '@/lib/validations/companyValidation';

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

    const existingCompany  = await Company.findOne({ email: value.email });

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

    return successResponse(
      {
        
        company: {
          id: company._id,
          companyName: company.companyName,
          email: company.email,
          location: company.location,
          industry: company.industry,
          description: company.description,
        },
      },
      'Company registered successfully',
      201
    );
  } catch (error) {
    console.error('[COMPANY_CREATE_ERROR]', error);
    const message = error instanceof Error ? error.message : 'Failed to register company';
    return errorResponse(message, 500);
  }
}
