"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
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
    <main className="w-full min-h-dvh flex flex-col bg-[#fafafa] pb-20 relative overflow-x-hidden text-[#333]">
      {/* Top Teal Navbar matching bruzoo.games reference image 1 */}
      <header className="w-full bg-[#00A091] text-white px-[16px] h-[50px] flex items-center gap-[16px] sticky top-0 z-40 select-none box-border">
        <button 
          onClick={() => router.back()} 
          className="hover:opacity-85 cursor-pointer p-0 border-none bg-transparent text-white flex items-center justify-center shrink-0 w-[24px]"
          aria-label="Go back"
        >
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 className="text-[18px] font-normal tracking-wide text-white m-0 text-left leading-none flex items-center">Register</h1>
      </header>

      {/* Form Content */}
      <div className="w-full flex-1 px-[16px] pt-[20px] pb-12 flex flex-col justify-start box-border">
        {error && (
          <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-[2px] text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[16px]">
          {/* Mobile Number Field */}
          <PhoneInput value={form.mobile} onChange={handleChange} placeholder="Mobile Number" />

          {/* Verification Code + OTP Button Row */}
          <div className="flex items-center gap-[12px] w-full">
            <div className="flex-1 flex items-center gap-[12px] border border-[#e4e4e4] rounded-[2px] bg-white px-[14px] h-[48px] focus-within:border-[#00A091] transition-colors select-none box-border">
              <div className="w-[20px] flex items-center justify-center shrink-0">
                <span className="material-icons-outlined text-[20px] text-[#888888]">chat_bubble_outline</span>
              </div>
              <input
                name="verificationCode"
                type="text"
                value={form.verificationCode}
                onChange={handleChange}
                placeholder="Verification Code"
                className="flex-1 bg-transparent text-[14px] text-[#222222] placeholder-[#adadad] outline-none border-none h-full font-normal shadow-none p-0"
              />
            </div>
            
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpCountdown > 0}
              className="w-[130px] shrink-0 h-[48px] bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e4e4e4] disabled:opacity-60 text-[#333333] text-center font-normal rounded-[2px] text-[14px] select-none cursor-pointer outline-none flex items-center justify-center transition-colors box-border"
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
          <div className="w-full flex items-center gap-[12px] border border-[#e4e4e4] rounded-[2px] bg-white px-[14px] h-[48px] focus-within:border-[#00A091] transition-colors select-none box-border">
            <div className="w-[20px] flex items-center justify-center shrink-0">
              <span className="material-icons-outlined text-[20px] text-[#888888]">card_giftcard</span>
            </div>
            <input
              id="inviteCode"
              name="inviteCode"
              type="text"
              value={form.inviteCode}
              onChange={handleChange}
              placeholder="Recommendation Code"
              className="flex-1 bg-transparent text-[14px] text-[#222222] placeholder-[#adadad] outline-none border-none h-full font-normal shadow-none p-0"
            />
          </div>

          {/* Privacy Policy Checkbox Row */}
          <div className="flex items-center gap-[8px] mt-[4px] mb-[12px] select-none">
            <input
              type="checkbox"
              id="privacy-agree"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="w-[16px] h-[16px] accent-[#111111] cursor-pointer"
            />
            <label htmlFor="privacy-agree" className="text-[13px] text-[#333333] cursor-pointer">
              I agree <Link href="/privacy" className="text-[#00A091] hover:underline">Privacy Policy</Link>
            </label>
          </div>

          {/* Register Action Button - sharp rectangular rounded-[2px] */}
          <div className="flex justify-center w-full">
            <button 
              type="submit" 
              disabled={loading}
              className="w-[62%] max-w-[280px] h-[44px] bg-[#00A091] hover:bg-[#008f81] disabled:opacity-60 text-white font-normal rounded-[2px] transition-colors cursor-pointer text-[14px] select-none border-0 outline-none flex items-center justify-center shadow-none mx-auto"
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
