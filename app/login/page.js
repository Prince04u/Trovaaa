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
      <header className="w-full bg-[#00A091] text-white pl-[16px] pr-[16px] h-[56px] flex items-center gap-[24px] sticky top-0 z-40 select-none shadow-[0_2px_5px_rgba(0,0,0,0.22)] box-border">
        <button 
          onClick={() => router.back()} 
          className="hover:opacity-85 cursor-pointer p-0 border-none bg-transparent text-white flex items-center justify-center shrink-0 w-[24px]"
          aria-label="Go back"
        >
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 className="text-[20px] font-normal tracking-wide text-white m-0 text-left leading-none flex items-center">Login</h1>
      </header>

      {/* Form Section with Responsive Desktop Spacing */}
      <div className="w-full flex-1 px-[24px] pt-[clamp(115px,15vh,130px)] pb-12 flex flex-col justify-start box-border">
        {error && (
          <div className="w-full mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-[2px] text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[34px]">
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

          {/* Centered Teal Login Submit Button */}
          <div className="flex justify-center w-full mt-[15px]">
            <button 
              type="submit" 
              disabled={loading}
              className="w-[58%] max-w-[240px] h-[44px] bg-[#00A091] hover:bg-[#008f81] disabled:opacity-60 text-white font-normal rounded-[2px] transition-colors cursor-pointer text-[14px] select-none border-0 outline-none flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.15)] mx-auto"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {/* Registration & Forgot Password sub-buttons centered row */}
          <div className="flex justify-center items-center gap-[12px] mt-[5px] select-none">
            <Link 
              href="/register" 
              className="w-[84px] h-[41px] bg-[#f9f9f9] hover:bg-[#f0f0f0] text-[#333333] border border-[#e4e4e4] shadow-[0_2px_4px_rgba(0,0,0,0.05)] rounded-[2px] text-[14px] text-decoration-none transition-colors flex items-center justify-center font-normal"
            >
              Register
            </Link>
            <Link 
              href="/support?form=password" 
              className="w-[145px] h-[41px] bg-[#f9f9f9] hover:bg-[#f0f0f0] text-[#333333] border border-[#e4e4e4] shadow-[0_2px_4px_rgba(0,0,0,0.05)] rounded-[2px] text-[14px] text-decoration-none transition-colors flex items-center justify-center font-normal"
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
