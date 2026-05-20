"use client"

import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { InputLabel, SelectOptionComponent, SubmitButton, TextInputComponent } from "@/app/components/form/input-components";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";




export default function SignupPage() {

  const schema = yup.object().shape({
  name: yup.string()
    .required("Name is required")
    .matches(/^[A-Z][a-z]+(?: [A-Z][a-z]+)+$/, "Invalid name format")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: yup.string()
    .required("Email is required")
    .email("Please provide a valid email address"),
  password: yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup.string()
    .oneOf([yup.ref("password")], "Password and confirm password should match")
    .required("Confirm Password is required"),
  role: yup.string()
    .oneOf(["candidate", "employer", "admin"], "Role must be one of: candidate, employer, admin")
    .default("candidate"),
  phone: yup.string()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, "Please provide a valid phone number")
    .optional(),
      // skills: yup.array().of(yup.string()).optional(),
      // education: yup.string().optional(),
      // experience: yup.string().optional(),
});
type FormData = yup.InferType<typeof schema>;


  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData, any>,
    defaultValues: {
      role: "candidate",
      // skills: []
    },
  });

  const router = useRouter()
  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (key === "skills" && Array.isArray(value)) {
          value.forEach((skill) => formData.append("skills", skill));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      const response = await fetch("/api/user", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            setError(field as keyof FormData, {
              type: "server",
              message: Array.isArray(messages) ? messages[0] : messages as string,
            });
          });
        } else {
          setError("root", {
            type: "server",
            message: result.message || "Failed to create user",
          });
        }
        return;
      }

      toast.success("Account created successfully, Please Login.")
      router.push("/login");
    } catch (error) {
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
            <h2 className="text-[1.7rem] font-bold text-navy mb-1 text-center">
              Create your account
            </h2>
            
            {errors.root && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
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

              <div>
                <InputLabel htmlFor="password">Password</InputLabel>
                <TextInputComponent 
                control={control}
                name="password"
                type="password"
                errMsg={errors.password ? errors.password.message as string : undefined}
                />
              </div>

              <div>
                <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
                <TextInputComponent 
                control={control}
                name="confirmPassword"
                type="password"
                errMsg={errors.confirmPassword ? errors.confirmPassword.message as string : undefined}
                />
              </div>

              <div>
                <InputLabel htmlFor="role">Role</InputLabel>
                <SelectOptionComponent
                  control={control}
                  name="role"
                  errMsg={errors.role ? errors.role.message as string : undefined}
                  options={[
                    { label: "Candidate", value: "candidate" },
                    { label: "Employer", value: "employer" }
                  ]}
                />
              </div>

                  
              <SubmitButton loading = {isSubmitting}>
               {isSubmitting ? "Creating Account..." : "Create Account"}
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
