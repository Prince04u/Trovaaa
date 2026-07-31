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
      <header className="w-full bg-[#00A091] text-white pl-[16px] pr-[16px] h-[56px] flex items-center gap-[10px] sticky top-0 z-40 select-none shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
        <button 
          onClick={() => router.back()} 
          className="hover:opacity-85 cursor-pointer p-0 border-none bg-transparent text-white flex items-center justify-center shrink-0"
          aria-label="Go back"
        >
          <ChevronLeft size={30} strokeWidth={1.5} />
        </button>
        <h1 className="text-[20px] font-normal tracking-wide text-white m-0 text-left">Register</h1>
      </header>

      {/* Form Content with Responsive Spacing */}
      <div className="w-full flex-1 px-[24px] pt-[24px] pb-12 flex flex-col justify-start box-border">
        {error && (
          <div className="w-full mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-[2px] text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[34px]">
          {/* Mobile Number Field */}
          <PhoneInput value={form.mobile} onChange={handleChange} placeholder="Mobile Number" />

          {/* Verification Code + OTP Button Row */}
          <div className="grid grid-cols-[1fr_95px] gap-[14px] items-center w-full">
            <div className="flex items-center gap-[14px] border border-[#e4e4e4] rounded-[2px] bg-white pl-[12px] pr-[16px] h-[48px] focus-within:border-[#00A091] transition-colors select-none shadow-[0_2px_4px_rgba(0,0,0,0.20)] box-border">
              <div className="w-[22px] flex items-center justify-center shrink-0">
                <MessageSquare size={22} className="text-[#7d7d7d]" strokeWidth={1.5} />
              </div>
              <input
                name="verificationCode"
                type="text"
                value={form.verificationCode}
                onChange={handleChange}
                placeholder="Verification Code"
                className="flex-1 bg-transparent text-[16px] text-[#222222] placeholder-[#adadad] outline-none focus:outline-none focus:ring-0 focus:border-none border-none h-full font-normal shadow-none p-0"
              />
            </div>
            
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpCountdown > 0}
              className="w-full h-[48px] bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e4e4e4] disabled:opacity-60 text-[#222222] text-center font-normal rounded-[2px] text-[16px] select-none cursor-pointer outline-none flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-colors box-border"
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
          <div className="w-full flex items-center gap-[14px] border border-[#e4e4e4] rounded-[2px] bg-white pl-[12px] pr-[16px] h-[48px] focus-within:border-[#00A091] transition-colors select-none shadow-[0_2px_4px_rgba(0,0,0,0.20)] box-border">
            <div className="w-[22px] flex items-center justify-center shrink-0">
              <Gift size={22} className="text-[#7d7d7d]" strokeWidth={1.5} />
            </div>
            <input
              id="inviteCode"
              name="inviteCode"
              type="text"
              value={form.inviteCode}
              onChange={handleChange}
              placeholder="Recommendation Code"
              className="flex-1 bg-transparent text-[16px] text-[#222222] placeholder-[#adadad] outline-none focus:outline-none focus:ring-0 focus:border-none border-none h-full font-normal shadow-none p-0"
            />
          </div>

          {/* Privacy Policy Checkbox Row (Left-aligned) */}
          <div className="flex flex-col">
            <label className="flex items-center gap-[8px] cursor-pointer select-none text-left">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="accent-black w-[20px] h-[20px] rounded-none cursor-pointer"
              />
              <span className="text-[14px] text-[#666666] font-normal leading-none">
                I agree <Link href="/privacy" target="_blank" className="text-[#00A091] font-normal text-decoration-none hover:underline">Privacy Policy</Link>
              </span>
            </label>

            {/* Register Action Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-[58%] max-w-[240px] mx-auto mt-[15px] h-[44px] bg-[#00A091] hover:bg-[#008f81] disabled:opacity-60 text-white font-normal rounded-[2px] transition-colors cursor-pointer text-[14px] select-none border-0 outline-none flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>

      <BottomNav />
    </main>
  );
}
