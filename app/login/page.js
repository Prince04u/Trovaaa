"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Phone, Key, ChevronLeft } from "lucide-react";
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
        <h1 className="text-[17px] font-normal tracking-wide text-white m-0">Login</h1>
      </header>

      {/* Form Section */}
      <div className="flex-1 px-4 py-8 flex flex-col justify-start">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

          {/* Centered Teal Login Submit Button */}
          <div className="flex justify-center mt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-[160px] h-[40px] bg-[#009688] hover:bg-[#00796b] disabled:opacity-60 text-white font-medium rounded-[4px] transition-colors cursor-pointer text-sm select-none border-0 outline-none flex items-center justify-center"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {/* Registration & Forgot Password sub-buttons centered */}
          <div className="flex justify-center items-center gap-3 mt-3 select-none">
            <Link 
              href="/register" 
              className="px-5 py-2 bg-[#EEEEEE] hover:bg-gray-200 text-[#333333] text-center font-normal rounded-[4px] text-[13px] text-decoration-none transition-colors"
            >
              Register
            </Link>
            <Link 
              href="/support?form=password" 
              className="px-4 py-2 bg-[#EEEEEE] hover:bg-gray-200 text-[#333333] text-center font-normal rounded-[4px] text-[13px] text-decoration-none transition-colors"
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
