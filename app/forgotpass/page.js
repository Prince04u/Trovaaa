"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PhoneInput from "@/components/auth/PhoneInput";
import PasswordInput from "@/components/auth/PasswordInput";
import BottomNav from "@/components/home/BottomNav";
import { changePassword } from "@/lib/authApi";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    mobile: "",
    verificationCode: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

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
    setSuccess("");

    setLoading(true);

    try {
      await changePassword({
        mobile: form.mobile,
        password: form.newPassword
      });
      setSuccess("Password reset successfully. You can now login.");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Password reset failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-dvh flex flex-col bg-[#fafafa] pb-20 relative overflow-x-hidden text-[#333]">
      {/* Top Teal Navbar */}
      <header className="w-full bg-[#00A091] text-white px-[16px] h-[50px] flex items-center gap-[16px] sticky top-0 z-40 select-none box-border shadow-sm">
        <button 
          onClick={() => router.back()} 
          className="hover:opacity-85 cursor-pointer p-0 border-none bg-transparent text-white flex items-center justify-center shrink-0 w-[24px]"
          aria-label="Go back"
        >
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 className="text-[18px] font-normal tracking-wide text-white m-0 text-left leading-none flex items-center">Forget Password</h1>
      </header>

      {/* Form Content */}
      <div className="w-full flex-1 px-[16px] pt-[20px] pb-12 flex flex-col justify-start box-border">
        {error && (
          <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-[2px] text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="w-full mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-[2px] text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[16px]">
          {/* Mobile Number Field */}
          <PhoneInput value={form.mobile} onChange={handleChange} placeholder="Mobile Number" />

          {/* Verification Code + OTP Button Row */}
          <div className="flex items-center gap-[12px] w-full">
            <div className="van-card-input flex-1">
              <div className="w-[20px] flex items-center justify-center shrink-0 mr-[12px]">
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
              className="van-otp-btn shrink-0"
            >
              {otpCountdown > 0 ? `${otpCountdown}s` : "OTP"}
            </button>
          </div>

          {/* New Password Field */}
          <PasswordInput
            id="newPassword"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="New Password"
          />

          {/* Submit Action Button */}
          <div className="flex justify-center w-full mt-[12px]">
            <button 
              type="submit" 
              disabled={loading}
              className="van-btn-teal w-[160px] mx-auto"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>

      <BottomNav />
    </main>
  );
}
