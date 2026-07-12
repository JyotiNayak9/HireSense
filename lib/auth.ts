import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt, { JwtPayload } from 'jsonwebtoken';

export type AccountType = 'candidate' | 'company';

export interface AuthSession {
  accountId: string;
  accountType: AccountType;
  email: string;
  role: string;
  name?: string;
  companyId?: string;
  userId?: string;
}

const isAccountType = (value: unknown): value is AccountType => {
  return value === 'candidate' || value === 'company';
};

export async function getAuthSession(): Promise<AuthSession | null> {
  const token = (await cookies()).get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (typeof decoded === 'string') {
      return null;
    }

    const payload = decoded as JwtPayload & Partial<AuthSession>;

    if (
      !payload.accountId ||
      !payload.email ||
      !payload.role ||
      !isAccountType(payload.accountType)
    ) {
      return null;
    }

    return {
      name: payload.name ? String(payload.name) : undefined,
      accountId: String(payload.accountId),
      accountType: payload.accountType,
      email: String(payload.email),
      role: String(payload.role),
      companyId: payload.companyId ? String(payload.companyId) : undefined,
      userId: payload.userId ? String(payload.userId) : undefined,
    };
  } catch {
    return null;
  }
}

export async function requireCompanySession() {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  if (session.accountType !== 'company' || session.role !== 'company') {
    redirect('/login');
  }

  return session;
}


export async function requireCandidateSession() {
    const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }
  if(session.accountType !== 'candidate' || session.role !== 'candidate') {
    redirect('/login');
  }
  return session;
}