"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { HiX, HiArrowRight } from 'react-icons/hi';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useAuthModal } from '@/app/context/AuthModalContext';
import {
  InputLabel,
  TextInputComponent,
  SelectOptionComponent,
  SubmitButton,
} from '@/app/components/form/input-components';
import logoSrc from '../../../public/hiresense-logo.png';

const industryOptions = [
  { label: 'Technology', value: 'Technology' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Manufacturing', value: 'Manufacturing' },
  { label: 'Education', value: 'Education' },
  { label: 'Real Estate', value: 'Real Estate' },
  { label: 'Entertainment', value: 'Entertainment' },
  { label: 'Energy', value: 'Energy' },
  { label: 'Telecommunications', value: 'Telecommunications' },
  { label: 'Other', value: 'Other' },
];

function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm pt-10 pb-10"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}

function ModalCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
    >
      <HiX className="h-5 w-5" />
    </button>
  );
}

/* ---------- LOGIN FORM ---------- */

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const { closeModal, openRegister } = useAuthModal();

  const schema = yup.object().shape({
    accountType: yup.string().oneOf(['candidate', 'company', 'admin'], 'Please select a valid login type').required('Login type is required'),
    email: yup.string().required('Email is required').email('Please provide a valid email address'),
    password: yup.string().required('Password is required'),
  });
  type FormData = yup.InferType<typeof schema>;

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: { accountType: 'candidate', email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value as string);
      });

      const response = await fetch('/api/login', { method: 'POST', body: formData });
      const result: { data?: { accountType?: string }; message?: string } = await response.json();

      if (!response.ok) {
        setError('root', { type: 'server', message: result.message || 'Login failed' });
        return;
      }

      toast.success('Login successful.');
      closeModal();
      router.push(
        result.data?.accountType === 'company'
          ? '/dashboard/company'
          : result.data?.accountType === 'admin'
          ? '/dashboard/admin'
          : '/dashboard/user'
      );
    } catch {
      setError('root', { type: 'server', message: 'An unexpected error occurred. Please try again.' });
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative">
      <ModalCloseButton onClose={closeModal} />

      <div className="flex items-center gap-2 mb-6">
        <Image src={logoSrc} alt="HireSense Logo" width={28} height={28} />
        <span className="font-bold text-sm text-slate-800">HireSense</span>
      </div>

      <h2 className="text-xl font-bold text-navy mb-1">Log in to your account</h2>

      {errors.root && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.root.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-5">
        <div>
          <InputLabel htmlFor="login-accountType">Login As</InputLabel>
          <SelectOptionComponent
            control={control}
            name="accountType"
            errMsg={errors.accountType ? errors.accountType.message as string : undefined}
            options={[
              { label: 'Applicant', value: 'candidate' },
              { label: 'Company', value: 'company' },
              { label: 'Admin', value: 'admin' },
            ]}
          />
        </div>

        <div>
          <InputLabel htmlFor="login-email">Email Address</InputLabel>
          <TextInputComponent control={control} name="email" type="email" errMsg={errors.email ? errors.email.message as string : undefined} />
        </div>

        <div>
          <InputLabel htmlFor="login-password">Password</InputLabel>
          <TextInputComponent control={control} name="password" type="password" errMsg={errors.password ? errors.password.message as string : undefined} />
        </div>

        <SubmitButton loading={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log in to Dashboard'}
          {!isSubmitting && <HiArrowRight className="w-4 h-4" />}
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-slate-600 mt-5">
        Don&apos;t have an account yet?{' '}
        <button type="button" onClick={() => openRegister()} className="text-navy font-semibold hover:opacity-70 transition-opacity">
          Sign up
        </button>
      </p>
    </div>
  );
}

/* ---------- APPLICANT SIGNUP FORM ---------- */

function ApplicantSignupForm() {
  const router = useRouter();
  const { closeModal, openLogin } = useAuthModal();

  const schema = yup.object().shape({
    name: yup.string().required('Name is required').matches(/^[A-Z][a-z]+(?: [A-Z][a-z]+)+$/, 'Invalid name format').min(2).max(100),
    email: yup.string().required('Email is required').email('Please provide a valid email address'),
    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    confirmPassword: yup.string().oneOf([yup.ref('password')], 'Password and confirm password should match').required('Confirm Password is required'),
  });
  type FormData = yup.InferType<typeof schema>;

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
  });

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();
      const payload = { ...data, role: 'candidate' };
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value as string);
      });

      const response = await fetch('/api/user', { method: 'POST', body: formData });
      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            setError(field as keyof FormData, { type: 'server', message: Array.isArray(messages) ? messages[0] : messages as string });
          });
        } else {
          setError('root', { type: 'server', message: result.message || 'Failed to create user' });
          toast.error(result.message || 'Failed to create user');
        }
        return;
      }

      toast.success('OTP sent to your email. Please verify your email to complete registration.');
      closeModal();
      router.push(`/verify-otp?email=${encodeURIComponent(result.data.email)}&type=candidate`);
    } catch {
      setError('root', { type: 'server', message: 'An unexpected error occurred. Please try again.' });
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-5">
      {errors.root && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.root.message}</p>
        </div>
      )}

      <div>
        <InputLabel htmlFor="reg-name">Full Name</InputLabel>
        <TextInputComponent control={control} name="name" errMsg={errors.name ? errors.name.message as string : undefined} />
      </div>

      <div>
        <InputLabel htmlFor="reg-email">Email Address</InputLabel>
        <TextInputComponent control={control} name="email" type="email" errMsg={errors.email ? errors.email.message as string : undefined} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <InputLabel htmlFor="reg-password">Password</InputLabel>
          <TextInputComponent control={control} name="password" type="password" errMsg={errors.password ? errors.password.message as string : undefined} />
        </div>
        <div>
          <InputLabel htmlFor="reg-confirmPassword">Confirm Password</InputLabel>
          <TextInputComponent control={control} name="confirmPassword" type="password" errMsg={errors.confirmPassword ? errors.confirmPassword.message as string : undefined} />
        </div>
      </div>

      <SubmitButton loading={isSubmitting}>
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
        {!isSubmitting && <HiArrowRight className="w-4 h-4" />}
      </SubmitButton>

      <p className="text-center text-sm text-slate-600 mt-4">
        Already have an account?{' '}
        <button type="button" onClick={() => openLogin()} className="text-navy font-semibold hover:opacity-70 transition-opacity">
          Log in
        </button>
      </p>
    </form>
  );
}

/* ---------- COMPANY SIGNUP FORM ---------- */

function CompanySignupForm() {
  const router = useRouter();
  const { closeModal, openLogin } = useAuthModal();

  const schema = yup.object().shape({
    companyName: yup.string().required('Company name is required').min(2).max(150),
    email: yup.string().required('Email is required').email('Please provide a valid email address'),
    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    confirmPassword: yup.string().oneOf([yup.ref('password')], 'Password and confirm password should match').required('Confirm Password is required'),
    phone: yup.string().matches(/^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, { message: 'Please provide a valid phone number', excludeEmptyString: true }).optional(),
    location: yup.string().required('Location is required'),
    industry: yup.string().oneOf(industryOptions.map(o => o.value), 'Please select a valid industry').required('Industry is required'),
    description: yup.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
  });
  type FormData = yup.InferType<typeof schema>;

  const { control, handleSubmit, register, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: { industry: 'Technology', phone: '', description: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value as string);
      });

      const response = await fetch('/api/company', { method: 'POST', body: formData });
      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            setError(field as keyof FormData, { type: 'server', message: Array.isArray(messages) ? messages[0] : messages as string });
          });
        } else {
          setError('root', { type: 'server', message: result.message || 'Failed to register company' });
          toast.error(result.message || 'Failed to register company');
        }
        return;
      }

      toast.success('OTP sent to your email. Please verify your email to complete registration.');
      closeModal();
      router.push(`/verify-otp?email=${encodeURIComponent(result.data.email)}&type=company`);
    } catch {
      setError('root', { type: 'server', message: 'An unexpected error occurred. Please try again.' });
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-5">
      {errors.root && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.root.message}</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <InputLabel htmlFor="reg-companyName">Company Name</InputLabel>
          <TextInputComponent control={control} name="companyName" errMsg={errors.companyName ? errors.companyName.message as string : undefined} />
        </div>
        <div>
          <InputLabel htmlFor="reg-email">Email Address</InputLabel>
          <TextInputComponent control={control} name="email" type="email" errMsg={errors.email ? errors.email.message as string : undefined} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <InputLabel htmlFor="reg-password">Password</InputLabel>
          <TextInputComponent control={control} name="password" type="password" errMsg={errors.password ? errors.password.message as string : undefined} />
        </div>
        <div>
          <InputLabel htmlFor="reg-confirmPassword">Confirm Password</InputLabel>
          <TextInputComponent control={control} name="confirmPassword" type="password" errMsg={errors.confirmPassword ? errors.confirmPassword.message as string : undefined} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <InputLabel htmlFor="reg-phone">Phone</InputLabel>
          <TextInputComponent control={control} name="phone" errMsg={errors.phone ? errors.phone.message as string : undefined} />
        </div>
        <div>
          <InputLabel htmlFor="reg-location">Location</InputLabel>
          <TextInputComponent control={control} name="location" errMsg={errors.location ? errors.location.message as string : undefined} />
        </div>
      </div>

      <div>
        <InputLabel htmlFor="reg-industry">Industry</InputLabel>
        <SelectOptionComponent control={control} name="industry" options={industryOptions} errMsg={errors.industry ? errors.industry.message as string : undefined} />
      </div>

      <div>
        <InputLabel htmlFor="reg-description">Company Description</InputLabel>
        <textarea
          id="reg-description"
          rows={3}
          {...register('description')}
          className={`w-full rounded-xl border px-4 py-2.5 text-[13px] font-medium text-slate-800 transition-all focus:border-[#203f99] focus:outline-none focus:ring-4 focus:ring-[#203f99]/5 ${errors.description ? 'border-red-500' : 'border-slate-200'}`}
        />
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message as string}</p>}
      </div>

      <SubmitButton loading={isSubmitting}>
        {isSubmitting ? 'Creating Company...' : 'Create Company Account'}
        {!isSubmitting && <HiArrowRight className="w-4 h-4" />}
      </SubmitButton>

      <p className="text-center text-sm text-slate-600 mt-4">
        Already have an account?{' '}
        <button type="button" onClick={() => openLogin()} className="text-navy font-semibold hover:opacity-70 transition-opacity">
          Log in
        </button>
      </p>
    </form>
  );
}

/* ---------- REGISTER MODAL ---------- */

function RegisterModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'applicant' | 'company'>('applicant');

  return (
    <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl relative" onClick={(e) => e.stopPropagation()}>
      <ModalCloseButton onClose={onClose} />

      <div className="flex items-center gap-2 mb-6">
        <Image src={logoSrc} alt="HireSense Logo" width={28} height={28} />
        <span className="font-bold text-sm text-slate-800">HireSense</span>
      </div>

      <h2 className="text-xl font-bold text-navy mb-1">Create your account</h2>

      <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 mt-4">
        <button
          type="button"
          onClick={() => setTab('applicant')}
          className={`rounded-md px-3 py-2.5 text-center text-xs font-bold transition-all ${
            tab === 'applicant' ? 'bg-navy text-white shadow-sm' : 'text-slate-700 hover:bg-white hover:text-navy'
          }`}
        >
          Register as applicant
        </button>
        <button
          type="button"
          onClick={() => setTab('company')}
          className={`rounded-md px-3 py-2.5 text-center text-xs font-bold transition-all ${
            tab === 'company' ? 'bg-navy text-white shadow-sm' : 'text-slate-700 hover:bg-white hover:text-navy'
          }`}
        >
          Register as a company
        </button>
      </div>

      {tab === 'applicant' ? <ApplicantSignupForm /> : <CompanySignupForm />}
    </div>
  );
}

/* ---------- MAIN EXPORT ---------- */

export default function AuthModals() {
  const { modal, closeModal } = useAuthModal();

  if (modal === 'login') {
    return (
      <ModalBackdrop onClose={closeModal}>
        <LoginForm onSuccess={closeModal} />
      </ModalBackdrop>
    );
  }

  if (modal === 'register') {
    return (
      <ModalBackdrop onClose={closeModal}>
        <RegisterModal onClose={closeModal} />
      </ModalBackdrop>
    );
  }

  return null;
}
