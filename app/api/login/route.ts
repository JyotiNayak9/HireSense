import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';
import User from '@/database/User.model';
import Company from '@/database/Company.model';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
type AccountType = 'candidate' | 'company';

const isAccountType = (value: string): value is AccountType => {
  return value === 'candidate' || value === 'company';
};

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();

    const formData = await request.formData();

    const body: Record<string, FormDataEntryValue> = {};
    formData.forEach((value, key) => {
      body[key] = value;
    });

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const accountType =
      typeof body.accountType === 'string' ? body.accountType : 'candidate';

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    if (!isAccountType(accountType)) {
      return errorResponse('Please select a valid login type', 400);
    }

    if (!JWT_SECRET) {
      return errorResponse('JWT secret not configured', 500);
    }

    if (accountType === 'company') {
      const company = await Company.findOne({ email }).select('+password');

      if (!company) {
        return errorResponse('Invalid email or password', 401);
      }

      if (!company.password) {
        return errorResponse('Invalid email or password', 401);
      }

      const isPasswordValid = await company.comparePassword(password);

      if (!isPasswordValid) {
        return errorResponse('Invalid email or password', 401);
      }

      const token = jwt.sign(
        {
          accountId: company._id,
          companyId: company._id,
          email: company.email,
          role: 'company',
          accountType,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const companyResponse = {
        id: company._id,
        companyName: company.companyName,
        email: company.email,
        role: company.role,
        location: company.location,
        industry: company.industry,
        description: company.description,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      };

      const response = successResponse(
        { accountType, company: companyResponse, token },
        'Login successful',
        200
      );

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    const token = jwt.sign(
      {
        accountId: user._id,
        userId: user._id,
        email: user.email,
        role: user.role,
        accountType,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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

    const response = successResponse(
      { accountType, user: userResponse, token },
      'Login successful',
      200
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('[LOGIN_ERROR]', error);
    const message = error instanceof Error ? error.message : 'Failed to login';
    return errorResponse(message, 500);
  }
}
