import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import User from '@/database/User.model';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/apiResponse';
import { validateCreateUser } from '@/lib/validations/userValidation';

export async function POST(request: NextRequest) {
  try {
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

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      skills: user.skills,
      education: user.education,
      experience: user.experience,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return successResponse(userResponse, 'User created successfully', 201);
  } catch (error) {
    console.error('[USER_CREATE_ERROR]', error);
    const message = error instanceof Error ? error.message : 'Failed to create user';
    return errorResponse(message, 500);
  }
}
