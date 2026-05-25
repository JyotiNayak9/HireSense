"use client";

import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  InputLabel,
  TextInputComponent,
  TextAreaInputComponent,
  SelectOptionComponent,
  TagInputComponent,
  SubmitButton,
} from '@/app/components/form/input-components';

const schema = yup.object({
  title: yup.string().trim().required('Job title is required').min(3, 'Job title must be at least 3 characters'),
  jobType: yup.string().oneOf(['Full-time', 'Part-time', 'Remote', 'Internship'], 'Please select a valid job type').required('Job type is required'),
  location: yup.string().trim().required('Location is required'),
  salaryRange: yup.string().trim().max(100, 'Salary range cannot exceed 100 characters').optional(),
  deadline: yup.string().required('Deadline is required'),
  description: yup.string().trim().required('Job description is required').min(20, 'Job description must be at least 20 characters'),
  requiredSkills: yup.array().of(yup.string().trim().required()).min(1, 'Please add at least one required skill'),
});

type FormData = yup.InferType<typeof schema>;

const jobTypes = [
  { label: 'Full-time', value: 'Full-time' },
  { label: 'Part-time', value: 'Part-time' },
  { label: 'Remote', value: 'Remote' },
  { label: 'Internship', value: 'Internship' },
];

export default function CompanyJobForm() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: {
      title: '',
      jobType: 'Full-time',
      location: '',
      salaryRange: '',
      deadline: '',
      description: '',
      requiredSkills: [],
    },
  });

  const onSubmit = async (values: FormData) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data?.message || 'Unable to post job');
        return;
      }

      toast.success('Job posted successfully');
      reset();
      router.push('/dashboard/company');
    } catch (error) {
      toast.error('Unable to post job');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <InputLabel htmlFor="title">Job Title</InputLabel>
          <TextInputComponent
            control={control}
            name="title"
            errMsg={errors.title?.message as string | undefined}
          />
        </div>
        <div>
          <InputLabel htmlFor="jobType">Job Type</InputLabel>
          <SelectOptionComponent
            control={control}
            name="jobType"
            options={jobTypes}
            errMsg={errors.jobType?.message as string | undefined}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <InputLabel htmlFor="location">Location</InputLabel>
          <TextInputComponent
            control={control}
            name="location"
            errMsg={errors.location?.message as string | undefined}
          />
        </div>
        <div>
          <InputLabel htmlFor="salaryRange">Salary Range (optional)</InputLabel>
          <TextInputComponent
            control={control}
            name="salaryRange"
            errMsg={errors.salaryRange?.message as string | undefined}
          />
        </div>
      </div>

      <div>
        <InputLabel htmlFor="deadline">Deadline</InputLabel>
        <TextInputComponent
          control={control}
          name="deadline"
          type="date"
          errMsg={errors.deadline?.message as string | undefined}
        />
      </div>

      <div>
        <InputLabel htmlFor="description">Job Description</InputLabel>
        <TextAreaInputComponent
          control={control}
          name="description"
          row={6}
          errMsg={errors.description?.message as string | undefined}
        />
      </div>

      <div>
        <InputLabel htmlFor="requiredSkills">Required Skills</InputLabel>
        <TagInputComponent
          control={control}
          name="requiredSkills"
          errMsg={errors.requiredSkills?.message as string | undefined}
        />
      </div>

      <SubmitButton loading={isSubmitting}>Post Job</SubmitButton>
    </form>
  );
}
