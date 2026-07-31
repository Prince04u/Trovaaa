"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { changePassword } from "@/lib/authApi";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    mobile: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

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
    <main className="w-full min-h-dvh flex flex-col bg-[#fafafa] relative overflow-x-hidden text-[#333]">
      {/* Top Navbar */}
      <header className="w-full bg-[#009688] text-white px-[16px] h-[56px] flex items-center gap-[24px] sticky top-0 z-40 select-none shadow-sm box-border">
        <button 
          onClick={() => router.back()} 
          className="hover:opacity-85 cursor-pointer p-0 border-none bg-transparent text-white flex items-center justify-center shrink-0 w-[24px]"
          aria-label="Go back"
        >
          <span className="material-icons text-[24px]">arrow_back</span>
        </button>
        <h1 className="text-[20px] font-medium tracking-wide text-white m-0 text-left leading-none flex items-center">Forget Password</h1>
      </header>

      {/* Form Section */}
      <div className="w-full flex-1 px-[24px] pt-[80px] pb-12 flex flex-col justify-start box-border">
        {error && (
          <div className="w-full mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="w-full mb-6 p-3 bg-green-50 border border-green-200 text-green-600 rounded text-sm text-center">
            {success}
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

          {/* New Password Field */}
          <div className="flex items-center gap-[12px] border-b border-[#ccc] bg-transparent py-2">
            <span className="material-icons text-[#888] text-[22px]">lock</span>
            <input
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={form.newPassword}
              onChange={handleChange}
              placeholder="New password"
              required
              className="flex-1 bg-transparent text-[16px] text-[#333] placeholder-[#aaa] outline-none border-none p-0"
            />
            <button 
              type="button" 
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="text-[#888] bg-transparent border-none p-0 flex items-center justify-center cursor-pointer hover:text-[#555]"
            >
              <span className="material-icons text-[22px]">{showNewPassword ? "visibility" : "visibility_off"}</span>
            </button>
          </div>
          
          {/* Confirm Password Field */}
          <div className="flex items-center gap-[12px] border-b border-[#ccc] bg-transparent py-2">
            <span className="material-icons text-[#888] text-[22px]">lock</span>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
              className="flex-1 bg-transparent text-[16px] text-[#333] placeholder-[#aaa] outline-none border-none p-0"
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-[#888] bg-transparent border-none p-0 flex items-center justify-center cursor-pointer hover:text-[#555]"
            >
              <span className="material-icons text-[22px]">{showConfirmPassword ? "visibility" : "visibility_off"}</span>
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center w-full mt-[30px]">
            <button 
              type="submit" 
              disabled={loading}
              className="w-[85%] max-w-[320px] h-[48px] bg-[#009688] hover:bg-[#00796b] disabled:opacity-60 text-white font-medium rounded-full transition-colors cursor-pointer text-[16px] border-0 outline-none flex items-center justify-center shadow-md mx-auto"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
