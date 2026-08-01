"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
    <main className="w-full min-h-dvh flex flex-col bg-[#fafafa] pb-20 relative overflow-x-hidden text-[#333]">
      {/* Top Teal Navbar - matching reference bruzoo.games */}
      <header className="w-full bg-[#00A091] text-white px-[16px] h-[50px] flex items-center gap-[16px] sticky top-0 z-40 select-none box-border">
        <button 
          onClick={() => router.back()} 
          className="hover:opacity-85 cursor-pointer p-0 border-none bg-transparent text-white flex items-center justify-center shrink-0 w-[24px]"
          aria-label="Go back"
        >
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 className="text-[18px] font-normal tracking-wide text-white m-0 text-left leading-none flex items-center">Login</h1>
      </header>

      {/* Form Section */}
      <div className="w-full flex-1 px-[16px] pt-[20px] pb-12 flex flex-col justify-start box-border">
        {error && (
          <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-[2px] text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[16px]">
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

          {/* Centered Teal Login Button - sharp rectangular rounded-[2px] */}
          <div className="flex justify-center w-full mt-[12px]">
            <button 
              type="submit" 
              disabled={loading}
              className="w-[160px] h-[42px] bg-[#00A091] hover:bg-[#008f81] disabled:opacity-60 text-white font-normal rounded-[2px] transition-colors cursor-pointer text-[14px] border-0 outline-none flex items-center justify-center shadow-none mx-auto"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {/* Sub-buttons: Register & Forgot Password? side-by-side rectangular buttons */}
          <div className="flex justify-center items-center gap-[12px] mt-[10px] select-none">
            <Link 
              href="/register" 
              className="w-[84px] h-[38px] bg-[#f9f9f9] hover:bg-[#f0f0f0] text-[#333333] border border-[#e4e4e4] rounded-[2px] text-[13px] text-decoration-none transition-colors flex items-center justify-center font-normal"
            >
              Register
            </Link>
            <Link 
              href="/forgotpass" 
              className="w-[145px] h-[38px] bg-[#f9f9f9] hover:bg-[#f0f0f0] text-[#333333] border border-[#e4e4e4] rounded-[2px] text-[13px] text-decoration-none transition-colors flex items-center justify-center font-normal"
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
