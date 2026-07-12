import nodemailer from 'nodemailer';
import crypto from 'crypto';
import redis from '@/lib/redis';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_ADDRESS = process.env.SMTP_FROM || 'noreply@hiresense.com';
const OTP_EXPIRY = 300; // 5 minutes
const RESEND_COOLDOWN = 60; // 60 seconds

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

async function getRedisKey(email: string, type: 'otp' | 'cooldown'): Promise<string> {
  return `verify:${email.toLowerCase()}:${type}`;
}

export async function storeOTP(email: string, otp: string): Promise<void> {
  const key = await getRedisKey(email, 'otp');
  await redis.setex(key, OTP_EXPIRY, otp);
}

export async function getStoredOTP(email: string): Promise<string | null> {
  const key = await getRedisKey(email, 'otp');
  return redis.get(key);
}

export async function deleteOTP(email: string): Promise<void> {
  const key = await getRedisKey(email, 'otp');
  await redis.del(key);
}

export async function checkCooldown(email: string): Promise<number> {
  const key = await getRedisKey(email, 'cooldown');
  const ttl = await redis.ttl(key);
  return Math.max(0, ttl);
}

export async function setCooldown(email: string): Promise<void> {
  const key = await getRedisKey(email, 'cooldown');
  await redis.setex(key, RESEND_COOLDOWN, '1');
}

export async function sendOTPEmail(
  email: string,
  name: string,
  otp: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to HireSense, ${name}!</h2>
      <p>Your email verification code is:</p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f3f4f6; padding: 12px 24px; border-radius: 8px;">
          ${otp}
        </span>
      </div>
      <p>Enter this code on the verification page to verify your email address.</p>
      <p style="color: #6b7280; font-size: 14px;">This code expires in 5 minutes.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px;">If you didn't create an account, you can ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"HireSense" <${FROM_ADDRESS}>`,
    to: email,
    subject: 'Your OTP for email verification - HireSense',
    html,
  });
}
