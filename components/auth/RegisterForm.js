"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Phone, Key, HelpCircle, ChevronLeft, MessageSquare, Gift } from "lucide-react";
import PhoneInput from "@/components/auth/PhoneInput";
import PasswordInput from "@/components/auth/PasswordInput";
import BottomNav from "@/components/home/BottomNav";
import { register as registerRequest } from "@/lib/authApi";
import { saveAuth } from "@/lib/auth";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    mobile: "",
    verificationCode: "",
    password: "",
    inviteCode: searchParams.get("ref")?.trim().toUpperCase() || "",
  });

  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  useEffect(() => {
    if (otpCountdown === 0) return;
    const interval = setInterval(() => {
      setOtpCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCountdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = () => {
    if (!form.mobile) {
      setError("Please enter mobile number first");
      return;
    }
    setOtpCountdown(60);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.inviteCode || !form.inviteCode.trim()) {
      setError("Referral code is required.");
      return;
    }

    if (!agree) {
      setError("Please agree to the Privacy Policy");
      return;
    }

    setLoading(true);

    try {
      const response = await registerRequest({
        name: `Player${form.mobile.slice(-4) || "01"}`,
        mobile: form.mobile,
        password: form.password,
        referralCode: form.inviteCode.trim().toUpperCase() || undefined,
      });

      saveAuth(response.data);
      router.push("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
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
        <h1 className="text-[18px] md:text-[20px] font-normal tracking-wide text-white m-0 text-left">Register</h1>
      </header>

      {/* Form Content with Responsive Spacing */}
      <div className="w-full flex-1 px-5 md:px-8 pt-6 md:pt-[28px] pb-12 flex flex-col justify-start">
        {error && (
          <div className="w-full mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-[3px] text-xs md:text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 md:gap-[32px]">
          {/* Mobile Number Field */}
          <PhoneInput value={form.mobile} onChange={handleChange} placeholder="Mobile Number" />

          {/* Verification Code + OTP Button Row */}
          <div className="grid grid-cols-12 gap-3 md:gap-6 items-center w-full">
            <div className="col-span-8 md:col-span-9 flex items-center gap-3.5 border border-[#E5E5E5] rounded-[2px] bg-white px-4 h-[48px] md:h-[52px] focus-within:border-[#009688] transition-colors select-none shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <MessageSquare size={20} className="text-[#8A8A8A] shrink-0" strokeWidth={1.75} />
              <input
                name="verificationCode"
                type="text"
                value={form.verificationCode}
                onChange={handleChange}
                placeholder="Verification Code"
                className="flex-1 bg-transparent text-[15px] md:text-[16px] text-[#222222] placeholder-[#8A8A8A] outline-none focus:outline-none focus:ring-0 focus:border-none border-none h-full font-normal shadow-none"
              />
            </div>
            
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpCountdown > 0}
              className="col-span-4 md:col-span-3 h-[48px] md:h-[52px] bg-[#F5F5F5] hover:bg-[#E8E8E8] border border-[#E5E5E5] disabled:opacity-60 text-[#333333] text-center font-normal rounded-[2px] text-[13px] md:text-[14px] select-none cursor-pointer outline-none flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors"
            >
              {otpCountdown > 0 ? `${otpCountdown}s` : "OTP"}
            </button>
          </div>

          {/* Password Field */}
          <PasswordInput
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
          />

          {/* Recommendation Code (Invite Code) */}
          <div className="w-full flex items-center gap-3.5 border border-[#E5E5E5] rounded-[2px] bg-white px-4 h-[48px] md:h-[52px] focus-within:border-[#009688] transition-colors select-none shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <Gift size={20} className="text-[#8A8A8A] shrink-0" strokeWidth={1.75} />
            <input
              id="inviteCode"
              name="inviteCode"
              type="text"
              value={form.inviteCode}
              onChange={handleChange}
              placeholder="Recommendation Code"
              className="flex-1 bg-transparent text-[15px] md:text-[16px] text-[#222222] placeholder-[#8A8A8A] outline-none focus:outline-none focus:ring-0 focus:border-none border-none h-full font-normal shadow-none"
            />
          </div>

          {/* Privacy Policy Checkbox Row (Left-aligned) */}
          <label className="flex items-center gap-2.5 px-1 cursor-pointer select-none mt-1 justify-start text-left">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="accent-[#009688] w-4.5 h-4.5 rounded-[2px] cursor-pointer"
            />
            <span className="text-[13px] md:text-[14px] text-[#333333] font-normal">
              I agree <Link href="/privacy" target="_blank" className="text-[#009688] font-medium text-decoration-none">Privacy Policy</Link>
            </span>
          </label>

          {/* Register Action Button (~64% width on desktop, 100% on mobile) */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-[64%] md:max-w-[950px] mx-auto mt-4 md:mt-5 h-[44px] md:h-[48px] bg-[#009688] hover:bg-[#00796b] disabled:opacity-60 text-white font-medium rounded-[3px] transition-colors cursor-pointer text-[14px] md:text-[15px] select-none border-0 outline-none flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>

      <BottomNav />
    </main>
  );
}
