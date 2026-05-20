import { NextResponse } from 'next/server';
import Joi from 'joi';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export function successResponse<T>(
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status: statusCode }
  );
}

export function errorResponse(
  message: string,
  statusCode: number = 400,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status: statusCode }
  );
}

export function validationErrorResponse(
  joiError: Joi.ValidationError
): NextResponse<ApiResponse> {
  const errors: Record<string, string[]> = {};

  joiError.details.forEach((detail:any) => {
    const key = detail.path.join('.');
    if (!errors[key]) {
      errors[key] = [];
    }
    errors[key].push(detail.message);
  });

  return errorResponse('Validation failed', 400, errors);
}
