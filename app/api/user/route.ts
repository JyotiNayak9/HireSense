
import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import User from '@/database/User.model';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/apiResponse';
import { validateCreateUser } from '@/lib/validations/userValidation';


import {
  generateOTP,
  storeOTP,
  sendOTPEmail,
} from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    console.log(process.env.MONGODBURI)
    await initializeDatabase();
    
    const formData = await request.formData();

    const body: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key === 'skills') {
        if (!body[key]) {
          body[key] = [];
        }
        body[key].push(value);
      } else {
        body[key] = value;
      }
    });

    const { error, value } = validateCreateUser(body);

    if (error) {
      return validationErrorResponse(error);
    }

    const existingUser = await User.findOne({ email: value.email });

    if (existingUser) {
      return errorResponse('User with this email already exists', 409);
    }

    const user = await User.create(value);

    const otp = generateOTP();
    await storeOTP(user.email, otp);
    await sendOTPEmail(user.email, user.name, otp);

    return successResponse(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
      },
      'User created successfully. Please verify your email with the OTP sent to your inbox.',
      201
    );
  } catch (error) {
    console.error('[USER_CREATE_ERROR]', error);
    const message = error instanceof Error ? error.message : 'Failed to create user';
    return errorResponse(message, 500);
  }
}
