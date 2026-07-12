import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import User from '@/database/User.model';
import Company from '@/database/Company.model';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getStoredOTP, deleteOTP } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();

    const body = await request.json();
    const { email, otp, accountType = 'user' } = body;

    if (!email || !otp) {
      return errorResponse('Email and OTP are required', 400);
    }

    const storedOTP = await getStoredOTP(email);

    if (!storedOTP) {
      return errorResponse('OTP has expired or is invalid. Please request a new one.', 400);
    }

    if (storedOTP !== otp) {
      return errorResponse('Invalid OTP. Please try again.', 400);
    }

    await deleteOTP(email);

    if (accountType === 'company') {
      const company = await Company.findOne({ email });
      if (!company) {
        return errorResponse('Company not found', 404);
      }
      company.isVerified = true;
      await company.save();
    } else {
      const user = await User.findOne({ email });
      if (!user) {
        return errorResponse('User not found', 404);
      }
      user.isVerified = true;
      await user.save();
    }

    return successResponse(null, 'Email verified successfully');
  } catch (error) {
    console.error('[VERIFY_OTP_ERROR]', error);
    const message = error instanceof Error ? error.message : 'Failed to verify OTP';
    return errorResponse(message, 500);
  }
}
