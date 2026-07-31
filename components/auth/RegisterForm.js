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
    <main className="min-h-screen bg-white pb-20 flex flex-col max-w-[480px] mx-auto relative shadow-md">
      {/* Teal Header Bar matching reference screenshot */}
      <header className="bg-[#009688] text-white px-4 h-12 flex items-center gap-3 sticky top-0 z-40 select-none">
        <button 
          onClick={() => router.back()} 
          className="hover:opacity-85 cursor-pointer p-1 border-none bg-transparent text-white flex items-center justify-center"
          aria-label="Go back"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-[17px] font-normal tracking-wide text-white m-0">Register</h1>
      </header>

      {/* Form Content */}
      <div className="flex-1 px-4 py-8 flex flex-col justify-start">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Mobile Number Field */}
          <PhoneInput value={form.mobile} onChange={handleChange} placeholder="Mobile Number" />

          {/* Verification Code + OTP Button Row */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-8 flex items-center gap-3 border border-[#E0E0E0] rounded-[4px] bg-white px-3.5 py-2 h-[46px] focus-within:border-[#009688] transition-colors select-none">
              <MessageSquare size={18} className="text-[#9E9E9E] shrink-0" strokeWidth={1.75} />
              <input
                name="verificationCode"
                type="text"
                value={form.verificationCode}
                onChange={handleChange}
                placeholder="Verification Code"
                className="flex-1 bg-transparent text-sm text-[#222222] placeholder-[#9E9E9E] outline-none border-none h-full font-normal"
              />
            </div>
            
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpCountdown > 0}
              className="col-span-4 h-[46px] bg-[#EEEEEE] hover:bg-gray-200 disabled:opacity-60 text-[#333333] text-center font-normal rounded-[4px] text-[13px] select-none cursor-pointer border-0 outline-none flex items-center justify-center"
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
          <div className="flex items-center gap-3 border border-[#E0E0E0] rounded-[4px] bg-white px-3.5 py-2 h-[46px] focus-within:border-[#009688] transition-colors select-none">
            <Gift size={18} className="text-[#9E9E9E] shrink-0" strokeWidth={1.75} />
            <input
              id="inviteCode"
              name="inviteCode"
              type="text"
              value={form.inviteCode}
              onChange={handleChange}
              placeholder="Recommendation Code"
              className="flex-1 bg-transparent text-sm text-[#222222] placeholder-[#9E9E9E] outline-none border-none h-full font-normal"
            />
          </div>

          {/* Privacy Policy Checkbox */}
          <label className="flex items-center gap-2 px-1 cursor-pointer select-none mt-1">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="accent-[#009688] w-4 h-4 rounded-[2px]"
            />
            <span className="text-[13px] text-[#333333] font-normal">
              I agree <Link href="/privacy" target="_blank" className="text-[#009688] font-medium text-decoration-none">Privacy Policy</Link>
            </span>
          </label>

          {/* Full-width Register Action Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 h-[44px] bg-[#009688] hover:bg-[#00796b] disabled:opacity-60 text-white font-medium rounded-[4px] transition-colors cursor-pointer text-sm select-none border-0 outline-none flex items-center justify-center"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>

      <BottomNav />
    </main>
  );
}
