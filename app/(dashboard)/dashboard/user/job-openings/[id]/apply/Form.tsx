"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputLabel, TextInputComponent, TextAreaInputComponent, TagInputComponent, SubmitButton } from '@/app/components/form/input-components';
import { toast } from 'react-toastify';

type ResumeItem = {
  _id: string;
  fileUrl: string;
  originalName?: string | null;
  createdAt: string;
};

const schema = yup.object().shape({
  name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please provide a valid email address'),
  phone: yup
    .string()
    .matches(
      /^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      { message: 'Please provide a valid phone number', excludeEmptyString: true }
    ),
  skills: yup.array().of(yup.string()),
  experience: yup
    .string()
    .required('Experience is required')
    .min(10, 'Please provide at least 10 characters describing your experience'),
});

type ApplicationFormValues = yup.InferType<typeof schema>;

export default function ApplicationForm({
  jobId,
  defaultName,
  defaultEmail,
  defaultPhone,
}: {
  jobId: string;
  defaultName: string;
  defaultEmail: string;
  defaultPhone?: string;
}) {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { control, handleSubmit, reset, formState: { errors }, setError } = useForm<ApplicationFormValues>({
    resolver: yupResolver(schema) as Resolver<ApplicationFormValues>,
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
      phone: defaultPhone ?? '',
      skills: [],
      experience: '',
    },
  });

  async function loadResumes() {
    try {
      const res = await fetch('/api/resume');
      const json = await res.json();
      if (res.ok) setResumes(json.data || []);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadResumes();
  }, []);

  async function uploadResume() {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/resume', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.message || 'Resume upload failed');
    }
    const json = await res.json();
    await loadResumes();
    return json.data?._id || null;
  }

  async function onSubmit(values: ApplicationFormValues) {
    setLoading(true);

    try {
      let resumeId = selectedResume;
      if (!resumeId && file) {
        resumeId = await uploadResume();
      }
      if (!resumeId) {
        toast.error('Please select an existing resume or upload a new one.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          resumeId,
          name: values.name,
          email: values.email,
          phone: values.phone,
          skills: values.skills,
          experience: values.experience,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.errors) {
          Object.entries(json.errors).forEach(([field, messages]) => {
            setError(field as keyof ApplicationFormValues, {
              type: 'server',
              message: Array.isArray(messages) ? messages[0] : messages as string,
            });
          });
        } else {
          setError('root', { type: 'server', message: json?.message || 'Unable to submit application' });
        }
        setLoading(false);
        return;
      }

      toast.success('Application submitted successfully!');
      reset({ name: defaultName, email: defaultEmail, phone: defaultPhone ?? '', skills: [], experience: '' });
      setSelectedResume(null);
      setFile(null);
      router.push('/dashboard/user/applications');
    } catch (error: any) {
      setError('root', { type: 'server', message: error?.message || 'Submission failed' });
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {errors.root && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.root.message}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <InputLabel htmlFor="name">Full Name</InputLabel>
          <TextInputComponent
            control={control}
            name="name"
            errMsg={errors.name ? errors.name.message as string : undefined}
          />
        </div>
        <div>
          <InputLabel htmlFor="email">Email Address</InputLabel>
          <TextInputComponent
            control={control}
            name="email"
            type="email"
            errMsg={errors.email ? errors.email.message as string : undefined}
          />
        </div>
        <div className="md:col-span-2">
          <InputLabel htmlFor="phone">Phone Number</InputLabel>
          <TextInputComponent
            control={control}
            name="phone"
            type="tel"
            errMsg={errors.phone ? errors.phone.message as string : undefined}
          />
        </div>
      </div>

      <div>
        <InputLabel htmlFor="skills">Skills</InputLabel>
        <TagInputComponent control={control} name="skills" errMsg={errors.skills ? errors.skills.message as string : undefined} />
      </div>

      <div>
        <InputLabel htmlFor="experience">Experience</InputLabel>
        <TextAreaInputComponent
          control={control}
          name="experience"
          errMsg={errors.experience ? errors.experience.message as string : undefined}
          row={6}
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Resume</p>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-700 mb-2">Select an already uploaded resume</p>
            <div className="space-y-2">
              {resumes.length === 0 ? (
                <div className="text-sm text-slate-500">No existing resumes found.</div>
              ) : (
                resumes.map((resume) => (
                  <label key={resume._id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-slate-100 cursor-pointer">
                    <input
                      type="radio"
                      name="resume"
                      value={resume._id}
                      checked={selectedResume === resume._id}
                      onChange={() => {
                        setSelectedResume(resume._id);
                        setFile(null);
                      }}
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900">{resume.originalName || 'Untitled resume'}</div>
                      <div className="text-xs text-slate-500">Uploaded {new Date(resume.createdAt).toLocaleDateString()}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-700 mb-2">Or upload a new resume</p>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0] ?? null;
                setFile(selectedFile);
                if (selectedFile) {
                  setSelectedResume(null);
                }
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
            />
            {file && <div className="mt-2 text-sm text-slate-600">Selected: {file.name}</div>}
          </div>
        </div>
      </div>

      <div>
        <SubmitButton loading={loading}>{loading ? 'Submitting...' : 'Submit Application'}</SubmitButton>
      </div>
    </form>
  );
}
