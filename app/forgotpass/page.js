"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PhoneInput from "@/components/auth/PhoneInput";
import PasswordInput from "@/components/auth/PasswordInput";
import BottomNav from "@/components/home/BottomNav";
import { BACK_ICON_B64, CHAT_ICON_B64 } from "@/components/auth/AuthIconsData";
import { useToasts, ToastStack } from "@/components/ui/Toast";

import LoadingDialog from "@/components/auth/LoadingDialog";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    mobile: "",
    verificationCode: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const { toasts, push: pushToast } = useToasts();
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpSending, setOtpSending] = useState(false);

  useEffect(() => {
    // Clear form on initial mount to defeat bfcache/browser restore
    setForm({ mobile: "", verificationCode: "", newPassword: "" });

    // Clear form when user switches tabs or hides browser
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        window.location.reload();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };



  // Countdown timer for OTP
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleSendOtp = async () => {
    if (!form.mobile) {
      pushToast("Mobile number is required", "error");
      return;
    }
    if (!/^\+91\d{10}$/.test(form.mobile)) {
      pushToast("Invalid phone number", "error");
      return;
    }
    // if (!form.password) {
    //   setPasswordError(true);
    // } else {
    //   setPasswordError(false);
    // }
    try {
      setTimeout(() => {
        pushToast("success", "success");
        setOtpCountdown(180);
      }, 1000);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: form.mobile, action: "reset_pass" }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.message && (data.message.toLowerCase().includes("verification") || data.message.toLowerCase().includes("false"))) {
          pushToast("Verification Code is false", "error");
        } else {
          console.warn("SMS dispatch warning (mock generated):", data.message);
        }
      } else {

      }
    } catch (err) {
      console.error("Failed to fetch send-otp in forgotpass:", err);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.mobile) {
      pushToast("Mobile number is required");
      return;
    }
    if (!form.verificationCode) {
      pushToast("Verification code is required");
      return;
    }
    if (!form.newPassword) {
      pushToast("Password is required");
      return;
    }
    if (form.newPassword.length < 6) {
      pushToast("Password must be at least 6 characters");
      return;
    }


    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: form.mobile,
          code: form.verificationCode,
          password: form.newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        pushToast("success", "success");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        pushToast(data.message || "Password reset failed. Please try again.");
      }
    } catch (err) {
      console.log(err);
      pushToast("Password reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-dvh flex flex-col bg-[#fafafa] pb-20 relative overflow-x-hidden">
      <ToastStack toasts={toasts} />
      <LoadingDialog visible={loading} />
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
        <span className="text-[20px] font-medium tracking-[0.02em] text-white leading-[56px]">Reset Password</span>
      </header>

      {/* Form Content — recharge_box from reference */}
      <div className="w-full flex-1 box-border" style={{ padding: '24px' }}>

        <form onSubmit={handleSubmit} className="w-full flex flex-col" noValidate>
          {/* Mobile Number Field — 35px margin-bottom */}
          <div style={{ marginBottom: '35px' }}>
            <PhoneInput value={form.mobile} onChange={handleChange} placeholder="Mobile Number" required={false} />
          </div>

          {/* Verification Code + OTP Button Row — special_box from reference */}
          <div className="w-full flex flex-row justify-between" style={{ marginBottom: '35px' }}>
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
              disabled={otpCountdown > 0 || otpSending}
              className="van-otp-btn shrink-0"
            >
              {otpSending ? "Sending..." : otpCountdown > 0 ? `${otpCountdown}s` : "OTP"}
            </button>
          </div>

          {/* New Password Field — 35px margin-bottom */}
          <div style={{ marginBottom: '35px' }}>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required={false}
              placeholder="New Password"
            />
          </div>

          {/* Submit Action Button — 65% width from reference */}
          <div className="flex justify-center w-full" style={{ padding: '15px 0 0 0' }}>
            <button
              type="submit"
              disabled={loading}
              className="van-btn-teal"
              style={{ width: '65%', maxWidth: '640px' }}
            >
              {"Submit"}
            </button>
          </div>
        </form>
      </div>

      <BottomNav />
    </main>
  );
}
