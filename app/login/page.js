"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Phone, Key, ChevronLeft } from "lucide-react";
import PhoneInput from "@/components/auth/PhoneInput";
import PasswordInput from "@/components/auth/PasswordInput";
import BottomNav from "@/components/home/BottomNav";
import { login as loginRequest } from "@/lib/authApi";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ mobile: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginRequest(form);
      saveAuth(response.data);
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-dvh flex flex-col bg-[#FAFAFA] pb-20 relative overflow-x-hidden">
      {/* Full-width Teal Header Bar matching reference screenshot */}
      <header className="w-full bg-[#009688] text-white px-4 md:px-6 h-12 md:h-[56px] flex items-center gap-3 sticky top-0 z-40 select-none shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
        <button 
          onClick={() => router.back()} 
          className="hover:opacity-85 cursor-pointer p-1 border-none bg-transparent text-white flex items-center justify-center shrink-0"
          aria-label="Go back"
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
        <h1 className="text-[18px] md:text-[20px] font-normal tracking-wide text-white m-0 text-left">Login</h1>
      </header>

      {/* Form Section with Responsive Desktop Spacing */}
      <div className="w-full flex-1 px-5 md:px-8 pt-12 md:pt-[100px] pb-12 flex flex-col justify-start">
        {error && (
          <div className="w-full mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-[3px] text-xs md:text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 md:gap-[32px]">
          {/* Mobile Number Field */}
          <PhoneInput value={form.mobile} onChange={handleChange} placeholder="Mobile Number" />

          {/* Password Field */}
          <PasswordInput
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
          />

          {/* Centered Teal Login Submit Button (~240px wide on desktop) */}
          <div className="flex justify-center w-full mt-6 md:mt-[42px]">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full max-w-[240px] md:w-[240px] h-[44px] md:h-[48px] bg-[#009688] hover:bg-[#00796b] disabled:opacity-60 text-white font-medium rounded-[3px] transition-colors cursor-pointer text-[14px] md:text-[15px] select-none border-0 outline-none flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {/* Registration & Forgot Password sub-buttons centered row */}
          <div className="flex justify-center items-center gap-3 md:gap-4 mt-4 md:mt-[24px] select-none">
            <Link 
              href="/register" 
              className="h-[40px] md:h-[42px] px-6 bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#333333] border border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-[3px] text-[13px] md:text-[14px] text-decoration-none transition-colors flex items-center justify-center font-normal"
            >
              Register
            </Link>
            <Link 
              href="/support?form=password" 
              className="h-[40px] md:h-[42px] px-5 bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#333333] border border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-[3px] text-[13px] md:text-[14px] text-decoration-none transition-colors flex items-center justify-center font-normal"
            >
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>

      <BottomNav />
    </main>
  );
}
