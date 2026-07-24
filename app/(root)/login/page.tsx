"use client";

import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  InputLabel,
  SelectOptionComponent,
  SubmitButton,
  TextInputComponent,
} from "@/app/components/form/input-components";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../../../public/hiresense-logo.png";

export default function LoginPage() {
  const schema = yup.object().shape({
    accountType: yup
      .string()
      .oneOf(["candidate", "company", "admin"], "Please select a valid login type")
      .required("Login type is required"),
    email: yup
      .string()
      .required("Email is required")
      .email("Please provide a valid email address"),
    password: yup.string().required("Password is required"),
  });
  type FormData = yup.InferType<typeof schema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: {
      accountType: "candidate",
      email: "",
      password: "",
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

      const response = await fetch("/api/login", {
        method: "POST",
        body: formData,
      });

      const result: {
        data?: { accountType?: string };
        message?: string;
      } = await response.json();

      if (!response.ok) {
        setError("root", {
          type: "server",
          message: result.message || "Login failed",
        });
        return;
      }



      toast.success("Login successful.");
      router.push(
        result.data?.accountType === "company"
          ? "/dashboard/company"
          : result.data?.accountType === "admin"
          ? "/dashboard/admin"
          : "/dashboard/user"
      );
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
          <div className="w-full max-w-100 ">
            <div className="flex items-center gap-2 mb-6">
              <Image src={logo} alt="HireSense Logo" width={30} height={30} />
              <span className="font-bold text-[14px] text-slate-800">
                HireSense
              </span>
            </div>
            <h2 className="text-[1.7rem] font-bold text-navy mb-1 text-center">
              Log in to your account
            </h2>

            {errors.root && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
              <div>
                <InputLabel htmlFor="accountType">Login As</InputLabel>
                <SelectOptionComponent
                  control={control}
                  name="accountType"
                  errMsg={
                    errors.accountType
                      ? (errors.accountType.message as string)
                      : undefined
                  }
                  options={[
                    { label: "Applicant", value: "candidate" },
                    { label: "Company", value: "company" },
                    { label: "Admin", value: "admin" },
                  ]}
                />
              </div>

              <div>
                <InputLabel htmlFor="email">Email Address</InputLabel>
                <TextInputComponent
                  control={control}
                  name="email"
                  type="email"
                  errMsg={
                    errors.email ? (errors.email.message as string) : undefined
                  }
                />
              </div>

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

              <SubmitButton loading={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Log in to Dashboard"}
                {!isSubmitting && <HiArrowRight className="w-4 h-4" />}
              </SubmitButton>
            </form>

            <p className="text-center text-[15px] text-slate-600 mt-5">
              Dont have an account yet?{" "}
              <Link
                href="/register"
                className="text-navy font-semibold hover:opacity-70 transition-opacity"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
