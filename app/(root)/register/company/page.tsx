"use client";

import Link from "next/link";
import Image from "next/image";
import { HiArrowRight } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  InputLabel,
  SelectOptionComponent,
  SubmitButton,
  TextInputComponent,
} from "@/app/components/form/input-components";
import logo from "../../../../public/hiresense-logo.png";

const industryOptions = [
  { label: "Technology", value: "Technology" },
  { label: "Finance", value: "Finance" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Retail", value: "Retail" },
  { label: "Manufacturing", value: "Manufacturing" },
  { label: "Education", value: "Education" },
  { label: "Real Estate", value: "Real Estate" },
  { label: "Entertainment", value: "Entertainment" },
  { label: "Energy", value: "Energy" },
  { label: "Telecommunications", value: "Telecommunications" },
  { label: "Other", value: "Other" },
];

export default function CompanySignupPage() {
  const schema = yup.object().shape({
  
    email: yup
      .string()
      .required("Email is required")
      .email("Please provide a valid email address"),
    password: yup
      .string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Password and confirm password should match")
      .required("Confirm Password is required"),
    phone: yup
      .string()
      .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
        message: "Please provide a valid phone number",
        excludeEmptyString: true,
      })
      .optional(),
    companyName: yup
      .string()
      .required("Company name is required")
      .min(2, "Company name must be at least 2 characters")
      .max(150, "Company name cannot exceed 150 characters"),
    location: yup.string().required("Location is required"),
    industry: yup
      .string()
      .oneOf(
        industryOptions.map((option) => option.value),
        "Please select a valid industry"
      )
      .required("Industry is required"),
    description: yup
      .string()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional(),
  });
  type FormData = yup.InferType<typeof schema>;

  const {
    control,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: {
      industry: "Technology",
      phone: "",
      description: "",
    },
  });

  const router = useRouter();
  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      const response = await fetch("/api/company", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            setError(field as keyof FormData, {
              type: "server",
              message: Array.isArray(messages) ? messages[0] : (messages as string),
            });
          });
        } else {
          setError("root", {
            type: "server",
            message: result.message || "Failed to register company",
          });
        }
        return;
      }

      toast.success("Company registered successfully, please log in.");
      router.push("/login");
    } catch {
      setError("root", {
        type: "server",
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans mt-10">
      <div className="flex flex-col justify-between mt-2">
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-xl">
            <div className="flex items-center gap-2 mb-6">
              <Image src={logo} alt="HireSense Logo" width={30} height={30} />
              <span className="font-bold text-[14px] text-slate-800">
                HireSense
              </span>
            </div>
            <h2 className="text-[1.7rem] font-bold text-navy mb-1 text-center">
              Create your company account
            </h2>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-soft-bg p-1 mt-5">
              <Link
                href="/register"
                className="rounded-md px-3 py-2.5 text-center text-[13px] font-bold text-slate-700 transition-colors hover:bg-white hover:text-navy"
              >
                Register as applicant
              </Link>
              <Link
                href="/register/company"
                aria-current="page"
                className="rounded-md bg-navy px-3 py-2.5 text-center text-[13px] font-bold text-white shadow-sm"
              >
                Register as a company
              </Link>
            </div>

            {errors.root && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
               
<div>
                  <InputLabel htmlFor="companyName">Company Name</InputLabel>
                  <TextInputComponent
                    control={control}
                    name="companyName"
                    errMsg={
                      errors.companyName
                        ? (errors.companyName.message as string)
                        : undefined
                    }
                  />
                </div>
                <div>
                  <InputLabel htmlFor="email">Email Address</InputLabel>
                  <TextInputComponent
                    control={control}
                    name="email"
                    type="email"
                    errMsg={errors.email ? (errors.email.message as string) : undefined}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <InputLabel htmlFor="password">Password</InputLabel>
                  <TextInputComponent
                    control={control}
                    name="password"
                    type="password"
                    errMsg={
                      errors.password
                        ? (errors.password.message as string)
                        : undefined
                    }
                  />
                </div>

                <div>
                  <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
                  <TextInputComponent
                    control={control}
                    name="confirmPassword"
                    type="password"
                    errMsg={
                      errors.confirmPassword
                        ? (errors.confirmPassword.message as string)
                        : undefined
                    }
                  />
                </div>
              </div>

            

              <div className="grid gap-6 md:grid-cols-2">
                  <div>
                <InputLabel htmlFor="phone">Phone</InputLabel>
                <TextInputComponent
                  control={control}
                  name="phone"
                  errMsg={errors.phone ? (errors.phone.message as string) : undefined}
                />
              </div>

                <div>
                  <InputLabel htmlFor="location">Location</InputLabel>
                  <TextInputComponent
                    control={control}
                    name="location"
                    errMsg={
                      errors.location
                        ? (errors.location.message as string)
                        : undefined
                    }
                  />
                </div>
              </div>

              <div>
                <InputLabel htmlFor="industry">Industry</InputLabel>
                <SelectOptionComponent
                  control={control}
                  name="industry"
                  errMsg={
                    errors.industry ? (errors.industry.message as string) : undefined
                  }
                  options={industryOptions}
                />
              </div>

              <div>
                <InputLabel htmlFor="description">Company Description</InputLabel>
                <textarea
                  id="description"
                  rows={4}
                  {...register("description")}
                  className={`w-full rounded-lg border px-4 py-2.5 text-[13px] text-slate-800 transition-all focus:border-blue-accent focus:outline-none focus:ring-2 focus:ring-blue-accent/10 ${
                    errors.description ? "border-red-500" : "border-slate-400"
                  }`}
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.description.message as string}
                  </p>
                )}
              </div>

              <SubmitButton loading={isSubmitting}>
                {isSubmitting ? "Creating Company..." : "Create Company Account"}
                {!isSubmitting && <HiArrowRight className="w-4 h-4" />}
              </SubmitButton>
            </form>

            <p className="text-center text-[15px] text-slate-600 mt-5">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-navy font-semibold hover:opacity-70 transition-opacity"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
