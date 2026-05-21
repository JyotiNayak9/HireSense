import { NextResponse, type NextRequest } from 'next/server';

interface TokenPreview {
  accountType?: string;
  role?: string;
}

function readTokenPreview(token: string): TokenPreview | null {
  const [, payload] = token.split('.');

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      '='
    );

    return JSON.parse(atob(paddedPayload)) as TokenPreview;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const sessionPreview = token ? readTokenPreview(token) : null;

  if (
    sessionPreview?.accountType !== 'company' ||
    sessionPreview.role !== 'company'
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/company/:path*',
};
