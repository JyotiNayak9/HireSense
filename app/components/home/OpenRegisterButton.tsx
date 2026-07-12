"use client";

import { HiOutlineArrowUpRight } from "react-icons/hi2";
import { useAuthModal } from "@/app/context/AuthModalContext";

type Props = {
  label: string;
  className?: string;
};

export default function OpenRegisterButton({ label, className = "" }: Props) {
  const { openRegister } = useAuthModal();

  return (
    <button
      onClick={openRegister}
      className={className}
    >
      {label}
      <HiOutlineArrowUpRight className="w-5 h-5 stroke-[2.5]" />
    </button>
  );
}
