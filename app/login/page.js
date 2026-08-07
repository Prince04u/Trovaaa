"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import PhoneInput from "@/components/auth/PhoneInput";
import PasswordInput from "@/components/auth/PasswordInput";
import BottomNav from "@/components/home/BottomNav";
import { login as loginRequest } from "@/lib/authApi";
import { saveAuth, getToken } from "@/lib/auth";
import { BACK_ICON_B64 } from "@/components/auth/AuthIconsData";
import LoadingDialog from "@/components/auth/LoadingDialog";
import { useToasts, ToastStack } from "@/components/ui/Toast";

function LoginFormComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams ? searchParams.get("redirect") : null;
  const [form, setForm] = useState({ mobile: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { toasts, push: pushToast } = useToasts();
  const [passwordError, setPasswordError] = useState("");


  useEffect(() => {
    const token = getToken();
    if (token) {
      router.replace(redirectUrl || "/account");
      return;
    }

    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("show_relogin_toast") === "true") {
        sessionStorage.removeItem("show_relogin_toast");
        setTimeout(() => {
          pushToast("Please log in again", "error", 3000);
        }, 100);
      }
    }

    // Clear form on initial mount to defeat bfcache/browser restore
    setForm({ mobile: "", password: "" });

    // Clear form when user switches tabs or hides browser
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        window.location.reload();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [pushToast, router, redirectUrl]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.mobile) {
      pushToast("Mobile Number is required");
      return;
    }

    if (!/^\+91\d{10}$/.test(form.mobile)) {
      pushToast("Invalid phone number");
      return;
    }

    if (!form.password) {
      setPasswordError("Password is required");
      pushToast("Password is required");
      return;
    }

    setLoading(true);

    try {
      const response = await loginRequest(form);
      saveAuth(response.data);
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/account");
      }
    } catch (err) {
      pushToast("Password error", "error", 3000);
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
        <span className="text-[20px] font-medium tracking-[0.02em] text-white leading-[56px]">Login</span>
      </header>

      {/* Form Section — recharge_box from reference */}
      <div className="recharge_box w-full flex-1 box-border" style={{ marginTop: '24px', padding: '24px' }}>
        <form onSubmit={handleSubmit} className="w-full flex flex-col" autoComplete="off" noValidate>
          {/* Mobile Number Field — 35px margin-bottom */}
          <div style={{ marginBottom: '35px' }}>
            <PhoneInput value={form.mobile} onChange={handleChange} placeholder="Mobile Number" />
          </div>

          {/* Password Field — 35px margin-bottom */}
          <div style={{ marginBottom: '35px' }}>
            <PasswordInput
              id="password"
              name="password"
              value={form.password}
              onChange={(e) => {
                handleChange(e);
                if (e.target.value) {
                  setPasswordError("");
                }
              }}
              placeholder="Password"
              hasError={!!passwordError}
            />
            {passwordError && (
              <p className="text-[12px] text-red-600 font-normal mt-1.5 pl-1.5 text-left">
                {passwordError}
              </p>
            )}
          </div>

          {/* Login Button — exactly 240px wide, 44px tall, centered */}
          <div className="flex justify-center w-full" style={{ padding: '15px 0 0 0' }}>
            <button
              type="submit"
              disabled={loading}
              className="login_btn ripple van-btn-teal w-[240px] h-[44px] bg-[#009688] text-white text-[14px] font-normal border-none outline-none shadow-none cursor-pointer flex items-center justify-center rounded-[2px]"
            >
              {"Login"}
            </button>
          </div>

          {/* Sub-buttons: Register & Forgot Password — 240px container, 25px top margin */}
          <div className="flex justify-center w-full" style={{ padding: '0' }}>
            <div className="flex justify-between" style={{ width: '240px', marginTop: '25px' }}>
              <Link
                href="/register"
                className="ripplegrey flex items-center justify-center rounded-[4px] h-[38px] px-[15px] bg-[#f5f5f5] text-[#333] text-[13px] text-decoration-none cursor-pointer font-medium"
                style={{
                  border: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
                }}
              >
                Register
              </Link>
              <Link
                href="/forgotpass"
                className="ripplegrey flex items-center justify-center rounded-[4px] h-[38px] px-[12px] bg-[#f5f5f5] text-[#333] text-[13px] text-decoration-none cursor-pointer font-medium"
                style={{
                  border: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
                }}
              >
                Forgot Password?
              </Link>
            </div>
          </div>
        </form>
      </div>

      <BottomNav />
      <LoadingDialog visible={loading} />
      <ToastStack toasts={toasts} />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-sm text-[#999]">Loading...</div>}>
      <LoginFormComponent />
    </Suspense>
  );
}
