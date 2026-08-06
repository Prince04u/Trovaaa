"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import PhoneInput from "@/components/auth/PhoneInput";
import PasswordInput from "@/components/auth/PasswordInput";
import BottomNav from "@/components/home/BottomNav";
import { register as registerRequest } from "@/lib/authApi";
import { saveAuth } from "@/lib/auth";
import { CHAT_ICON_B64, GIFT_ICON_B64, BACK_ICON_B64 } from "@/components/auth/AuthIconsData";
import LoadingDialog from "@/components/auth/LoadingDialog";
import { useToasts, ToastStack } from "@/components/ui/Toast";

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
  const { toasts, push: pushToast } = useToasts();

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

  const handleSendOtp = async () => {
    if (!form.mobile) {
      setError("Please enter mobile number first");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: form.mobile }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to send OTP");
      } else {
        setTimeout(() => {
          pushToast("success", "success");
          setOtpCountdown(60);
        }, 1000);
      }
    } catch (err) {
      setError("Failed to send OTP. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.verificationCode) {
      setError("Please enter the verification code.");
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
        code: form.verificationCode,
      });

      saveAuth(response.data);
      
      setTimeout(() => {
        pushToast("success", "success");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-dvh flex flex-col bg-[#fafafa] pb-20 relative overflow-x-hidden">
      {/* Top Teal Navbar — exact luvomall.games reference */}
      <header className="w-full bg-[#009688] text-white px-[15px] h-[56px] flex items-center gap-[30px] sticky top-0 z-40 select-none box-border"
        style={{ boxShadow: '0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12)' }}>
        <button 
          onClick={() => router.back()} 
          className="hover:opacity-85 cursor-pointer p-0 border-none bg-transparent text-white flex items-center justify-center shrink-0"
          aria-label="Go back"
        >
          <img src={BACK_ICON_B64} alt="Back" width="20" height="20" style={{ display: 'block', width: '20px', height: '20px' }} />
        </button>
        <span className="text-[20px] font-medium tracking-[0.02em] text-white leading-[56px]">Register</span>
      </header>

      {/* Form Content — recharge_box from reference */}
      <div className="w-full flex-1 box-border" style={{ padding: '24px' }}>
        {error && (
          <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-[2px] text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col">
          {/* Mobile Number Field — 35px margin-bottom */}
          <div style={{ marginBottom: '35px' }}>
            <PhoneInput value={form.mobile} onChange={handleChange} placeholder="Mobile Number" />
          </div>

          {/* Verification Code + OTP Button Row — special_box from reference */}
          <div className="w-full flex flex-row justify-between" style={{ marginBottom: '24px' }}>
            <div className="van-card-input" style={{ width: '72%' }}>
              <div className="w-[20px] flex items-center justify-center shrink-0" style={{ marginRight: '10px' }}>
                <img src={CHAT_ICON_B64} alt="Verification Code" width="20" height="20" style={{ display: 'block', width: '20px', height: '20px' }} />
              </div>
              <input
                name="verificationCode"
                type="text"
                value={form.verificationCode}
                onChange={handleChange}
                placeholder="Verification Code"
                className="flex-1 bg-transparent text-[16px] placeholder-[#adadad] outline-none border-none h-full font-normal shadow-none p-0"
                style={{ color: 'rgba(0,0,0,.87)' }}
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

          {/* Password Field — 35px margin-bottom */}
          <div style={{ marginBottom: '35px' }}>
            <PasswordInput
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
            />
          </div>

          {/* Recommendation Code (Invite Code) — 35px margin-bottom */}
          <div style={{ marginBottom: '35px' }}>
            <div className="van-card-input">
              <div className="w-[20px] flex items-center justify-center shrink-0" style={{ marginRight: '10px' }}>
                <img src={GIFT_ICON_B64} alt="Recommendation Code" width="20" height="20" style={{ display: 'block', width: '20px', height: '20px' }} />
              </div>
              <input
                id="inviteCode"
                name="inviteCode"
                type="text"
                value={form.inviteCode}
                onChange={handleChange}
                placeholder="Recommendation Code"
                className="flex-1 bg-transparent text-[16px] placeholder-[#adadad] outline-none border-none h-full font-normal shadow-none p-0"
                style={{ color: 'rgba(0,0,0,.87)' }}
              />
            </div>
          </div>

          {/* Privacy Policy Checkbox Row — agree_box from reference */}
          <div className="flex items-center gap-[8px] select-none" style={{ marginBottom: '15px' }}>
            <input
              type="checkbox"
              id="privacy-agree"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="w-[16px] h-[16px] accent-[#111111] cursor-pointer"
            />
            <label htmlFor="privacy-agree" className="cursor-pointer" style={{ fontSize: '14px', color: 'rgba(0,0,0,.54)' }}>
              I agree <Link href="/privacy" className="hover:underline" style={{ color: '#009688', fontWeight: 400 }}>Privacy Policy</Link>
            </label>
          </div>

          {/* Register Action Button — 65% width from reference */}
          <div className="flex justify-center w-full" style={{ padding: '15px 0 0 0' }}>
            <button 
              type="submit" 
              disabled={loading}
              className="van-btn-teal"
              style={{ width: '65%', maxWidth: '640px' }}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>

      <BottomNav />
      <LoadingDialog visible={loading} />
      <ToastStack toasts={toasts} />
    </main>
  );
}

