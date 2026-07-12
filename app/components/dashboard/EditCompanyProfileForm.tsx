"use client";

import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { HiOutlineSave } from 'react-icons/hi';
import Link from 'next/link';
import {
  InputLabel,
  TextInputComponent,
  TextAreaInputComponent,
  SelectOptionComponent,
  SubmitButton,
} from '@/app/components/form/input-components';

const schema = yup.object({
  companyName: yup.string().trim().required('Company name is required').min(2, 'Company name must be at least 2 characters'),
  location: yup.string().trim().required('Location is required'),
  industry: yup.string().oneOf(['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Real Estate', 'Entertainment', 'Energy', 'Telecommunications', 'Other'], 'Please select a valid industry').required('Industry is required'),
  description: yup.string().trim().max(2000, 'Description cannot exceed 2000 characters').optional(),
});

type FormData = yup.InferType<typeof schema>;

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

type EditCompanyProfileFormProps = {
  initialData: FormData;
};

export default function EditCompanyProfileForm({ initialData }: EditCompanyProfileFormProps) {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: initialData,
  });

  const onSubmit = async (values: FormData) => {
    try {
      const response = await fetch('/api/company/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data?.message || 'Unable to update profile');
        return;
      }

      toast.success('Profile updated successfully');
      router.push('/dashboard/company/profile');
      router.refresh();
    } catch (error) {
      toast.error('Unable to update profile');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-xl">
      <div className="space-y-4">
        <div>
          <InputLabel htmlFor="companyName">Company Name</InputLabel>
          <TextInputComponent
            control={control}
            name="companyName"
            errMsg={errors.companyName?.message as string | undefined}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <InputLabel htmlFor="industry">Industry</InputLabel>
            <SelectOptionComponent
              control={control}
              name="industry"
              options={industryOptions}
              errMsg={errors.industry?.message as string | undefined}
            />
          </div>
          <div>
            <InputLabel htmlFor="location">Location</InputLabel>
            <TextInputComponent
              control={control}
              name="location"
              errMsg={errors.location?.message as string | undefined}
            />
          </div>
        </div>

        <div>
          <InputLabel htmlFor="description">Company Description</InputLabel>
          <TextAreaInputComponent
            control={control}
            name="description"
            row={5}
            errMsg={errors.description?.message as string | undefined}
          />
          <p className="text-xs font-medium text-slate-400 mt-1.5">Maximum 2000 characters</p>
        </div>
      </div>

      <hr className="border-slate-100 pt-2" />

      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
        <Link
          href="/dashboard/company/profile"
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors py-2 px-3 rounded-xl hover:bg-slate-50"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>

        <SubmitButton
          loading={isSubmitting}
          className="w-full sm:w-44 bg-[#203f99] hover:bg-[#18317a]"
        >
          <HiOutlineSave className="h-4 w-4" />
          Save Changes
        </SubmitButton>
      </div>
    </form>
  );
}
