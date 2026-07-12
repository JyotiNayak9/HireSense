"use client";

import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { HiOutlineArrowLeft, HiOutlineBriefcase, HiOutlineDocumentText } from 'react-icons/hi'; 
import { HiOutlinePlus } from 'react-icons/hi';
import Link from 'next/link';
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
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-xl ">
    
      {/* Structural Headers */}
      <div className="flex items-center gap-3 pb-2">
        <div className="flex items-center justify-center  bg-slate-50 text-slate-500">
          <HiOutlineBriefcase className="text-2xl" />
        </div>
        <div>
          <h3 className=" text-2xl font-bold text-slate-800">Job Specification</h3>
        </div>
      </div>
      
      <hr className="border-slate-100" />

      {/* Main Core Form Block Parameters */}
      <div className="space-y-4">
        <div>
          <InputLabel htmlFor="title">Job Title</InputLabel>
          <TextInputComponent
            control={control}
            name="title"
        
            errMsg={errors.title?.message as string | undefined}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <InputLabel htmlFor="jobType">Job Type</InputLabel>
            <SelectOptionComponent
              control={control}
              name="jobType"
              options={jobTypes}
              errMsg={errors.jobType?.message as string | undefined}
            />
          </div>
          <div>
            <InputLabel htmlFor="deadline">Application Deadline</InputLabel>
            <TextInputComponent
              control={control}
              name="deadline"
              type="date"
              errMsg={errors.deadline?.message as string | undefined}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <InputLabel htmlFor="location">Location</InputLabel>
            <TextInputComponent
              control={control}
              name="location"
              errMsg={errors.location?.message as string | undefined}
            />
          </div>
          <div>
            <InputLabel htmlFor="salaryRange">Salary Range <span className="text-slate-400 font-normal lowercase">(optional)</span></InputLabel>
            <TextInputComponent
              control={control}
              name="salaryRange"
              errMsg={errors.salaryRange?.message as string | undefined}
            />
          </div>
        </div>

        <div>
          <InputLabel htmlFor="requiredSkills">Required Skills Framework</InputLabel>
          <TagInputComponent
            control={control}
            name="requiredSkills"
            errMsg={errors.requiredSkills?.message as string | undefined}
          />
        </div>

        <div>
          <InputLabel htmlFor="description">Job Description</InputLabel>
          <TextAreaInputComponent
            control={control}
            name="description"
            row={5}
            errMsg={errors.description?.message as string | undefined}
          />
        </div>
      </div>

      <hr className="border-slate-100 pt-2" />

      {/* Persistent Horizontal Execution Action Strip */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
        <Link
          href="/dashboard/company"
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors py-2 px-3 rounded-xl hover:bg-slate-50"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <SubmitButton 
          loading={isSubmitting} 
          className="w-full sm:w-44 bg-[#203f99] hover:bg-[#18317a]"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Publish Position
        </SubmitButton>
      </div>

    </form>
  );
}