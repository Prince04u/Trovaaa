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
  const [showPassword, setShowPassword] = useState(false);

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
      {/* Top Navbar */}
      <header className="w-full bg-[#009688] text-white px-[16px] h-[56px] flex items-center gap-[24px] sticky top-0 z-40 select-none shadow-sm box-border">
        <button 
          onClick={() => router.back()} 
          className="hover:opacity-85 cursor-pointer p-0 border-none bg-transparent text-white flex items-center justify-center shrink-0 w-[24px]"
          aria-label="Go back"
        >
          <span className="material-icons text-[24px]">arrow_back</span>
        </button>
        <h1 className="text-[20px] font-medium tracking-wide text-white m-0 text-left leading-none flex items-center">Login</h1>
      </header>

      {/* Form Section */}
      <div className="w-full flex-1 px-[24px] pt-[80px] pb-12 flex flex-col justify-start box-border">
        {error && (
          <div className="w-full mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[24px]">
          {/* Phone Field */}
          <div className="flex items-center gap-[12px] border-b border-[#ccc] bg-transparent py-2">
            <span className="material-icons text-[#888] text-[22px]">phone</span>
            <input
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              placeholder="Phone number"
              required
              className="flex-1 bg-transparent text-[16px] text-[#333] placeholder-[#aaa] outline-none border-none p-0"
            />
          </div>

          {/* Password Field */}
          <div className="flex items-center gap-[12px] border-b border-[#ccc] bg-transparent py-2">
            <span className="material-icons text-[#888] text-[22px]">lock</span>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="flex-1 bg-transparent text-[16px] text-[#333] placeholder-[#aaa] outline-none border-none p-0"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#888] bg-transparent border-none p-0 flex items-center justify-center cursor-pointer hover:text-[#555]"
            >
              <span className="material-icons text-[22px]">{showPassword ? "visibility" : "visibility_off"}</span>
            </button>
          </div>

          {/* Login Button */}
          <div className="flex justify-center w-full mt-[30px]">
            <button 
              type="submit" 
              disabled={loading}
              className="w-[85%] max-w-[320px] h-[48px] bg-[#009688] hover:bg-[#00796b] disabled:opacity-60 text-white font-medium rounded-full transition-colors cursor-pointer text-[16px] border-0 outline-none flex items-center justify-center shadow-md mx-auto"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {/* Links Below */}
          <div className="flex justify-center items-center gap-[16px] mt-[10px]">
            <Link 
              href="/register" 
              className="text-[#555] hover:text-[#333] text-[14px] flex items-center justify-center border border-[#ddd] px-8 py-2.5 rounded-full bg-white shadow-sm font-medium w-[140px]"
            >
              Register
            </Link>
            <Link 
              href="/forgotpass" 
              className="text-[#555] hover:text-[#333] text-[14px] flex items-center justify-center border border-[#ddd] px-8 py-2.5 rounded-full bg-white shadow-sm font-medium w-[140px]"
            >
              Forgot password
            </Link>
          </div>
        </form>
      </div>

      <BottomNav />
    </main>
  );
}
