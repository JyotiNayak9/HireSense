'use client';

import { useEffect, useState, useRef } from 'react';
import { SubmitButton } from '@/app/components/form/input-components';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [email, setEmail] = useState('');
  const [accountType, setAccountType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resending, setResending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get('email');
    const t = params.get('type');
    if (e) setEmail(e);
    if (t) setAccountType(t);

    if (!e || !t) {
      setError('Missing verification details. Please register again.');
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [countdown]);

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code, accountType }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        toast.success('Email verified successfully! You can now log in.');
        router.push('/login');
      } else {
        setError(data.message || 'Verification failed.');
        toast.error(data.message || 'Verification failed.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (countdown > 0 || resending) return;

    setResending(true);
    setError('');

    try {
      const res = await fetch('/api/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, accountType }),
      });

      const data = await res.json();

      if (data.success) {
        setCountdown(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        if (res.status === 429) {
          const match = data.message?.match(/(\d+)/);
          setCountdown(match ? parseInt(match[1]) : 60);
        }
        setError(data.message || 'Failed to resend OTP.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setResending(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 pt-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Email Verified!</h1>
          <p className="mb-6 text-gray-600">Your email has been verified successfully.</p>
          <button
            onClick={() => router.push('/login')}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 ">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="mb-2 text-gray-600">
            Enter the 6-digit code sent to{' '}
            <strong className="text-gray-900">{email || 'your email'}</strong>
          </p>
        </div>

        <div className="my-8 flex justify-center gap-2 ">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-14 w-12 rounded-lg border border-gray-300 text-center text-2xl font-bold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          ))}
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}

<SubmitButton onClick={handleVerify} loading={verifying || otp.join('').length !== 6}>
          {verifying ? 'Verifying...' : 'Verify Email'}
        </SubmitButton>
       

        <div className="mt-6 text-center">
          {countdown > 0 ? (
            <p className="text-sm text-gray-500">
              Resend OTP in <span className="font-medium text-gray-700">{countdown}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm font-medium text-navy hover:text-- disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
