"use client";

import { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="w-full h-dvh flex items-center justify-center bg-[#fafafa]">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
