import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import User from '@/database/User.model';
import Company from '@/database/Company.model';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import {
  generateOTP,
  storeOTP,
  sendOTPEmail,
  checkCooldown,
  setCooldown,
} from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();

    const body = await request.json();
    const { email, accountType = 'user' } = body;

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    const remaining = await checkCooldown(email);
    if (remaining > 0) {
      return errorResponse(`Please wait ${remaining} seconds before requesting a new OTP.`, 429);
    }

    if (accountType === 'company') {
      const company = await Company.findOne({ email });
      if (!company) {
        return errorResponse('No account found with this email', 404);
      }
      if (company.isVerified) {
        return errorResponse('Email is already verified', 400);
      }
    } else {
      const user = await User.findOne({ email });
      if (!user) {
        return errorResponse('No account found with this email', 404);
      }
      if (user.isVerified) {
        return errorResponse('Email is already verified', 400);
      }
    }

    const otp = generateOTP();
    await storeOTP(email, otp);
    await setCooldown(email);

    const displayName = accountType === 'company' ? 'there' : 'there';
    await sendOTPEmail(email, displayName, otp);

    return successResponse(null, 'A new OTP has been sent to your email.');
  } catch (error) {
    console.error('[RESEND_OTP_ERROR]', error);
    const message = error instanceof Error ? error.message : 'Failed to resend OTP';
    return errorResponse(message, 500);
  }
}
