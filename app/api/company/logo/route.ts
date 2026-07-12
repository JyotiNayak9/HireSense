import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Company from '@/database/Company.model';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.', 400);
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return errorResponse('File too large. Maximum size is 5MB.', 400);
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return errorResponse('Company not found', 404);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'image',
      folder: 'hiresense/logos',
    });

    company.logo = uploadResult.secure_url;
    await company.save();

    return successResponse(
      { logo: uploadResult.secure_url },
      'Logo uploaded successfully'
    );
  } catch (err) {
    console.error('[COMPANY_LOGO_UPLOAD_ERROR]', err);
    const message = err instanceof Error ? err.message : 'Failed to upload logo';
    return errorResponse(message, 500);
  }
}

export async function DELETE(request: NextRequest) {
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

    const publicId = company.logo?.match(/\/hiresense\/logos\/(.+)\./)?.[1];
    if (publicId) {
      await cloudinary.uploader.destroy(`hiresense/logos/${publicId}`, { resource_type: 'image' });
    }

    company.logo = undefined as any;
    await company.save();

    return successResponse(null, 'Logo removed successfully');
  } catch (err) {
    console.error('[COMPANY_LOGO_DELETE_ERROR]', err);
    const message = err instanceof Error ? err.message : 'Failed to remove logo';
    return errorResponse(message, 500);
  }
}
