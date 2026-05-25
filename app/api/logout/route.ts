import { NextResponse } from 'next/server';
import { successResponse } from '@/lib/apiResponse';

export async function POST() {
  const response = successResponse({}, 'Logout successful', 200);

  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
  });

  return response;
}
