"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/home/BottomNav";
import { getUser } from "@/lib/auth";
import { addWithdrawAccount } from "@/lib/walletApi";
import { useToasts, ToastStack } from "@/components/ui/Toast";

export default function AddBankCardPage() {
  const { toasts, push: pushToast } = useToasts();
  const [otpCountdown, setOtpCountdown] = useState(0);
  const router = useRouter();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form, setForm] = useState({
    actualName: "",
    ifscCode: "",
    bankName: "",
    bankAccount: "",
    usdtAddress: "",
    state: "",
    city: "",
    address: "",
    mobileNumber: "",
    email: "",
    accountPhone: "",
    code: ""
  });

  useEffect(() => {
    const user = getUser();
    let phoneNum = user?.mobile || user?.phone || "";

    // Check if edit mode is active
    const searchParams = new URLSearchParams(window.location.search);
    const isEdit = searchParams.get("edit") === "true";
    if (isEdit) {
      const editCardStr = sessionStorage.getItem("edit_bank_card");
      if (editCardStr) {
        try {
          const card = JSON.parse(editCardStr);
          setForm({
            actualName: card.accountName || "",
            ifscCode: card.ifsc || "",
            bankName: card.bankName || "",
            bankAccount: card.accountNumber || "",
            usdtAddress: "",
            state: "",
            city: "",
            address: "",
            mobileNumber: phoneNum,
            email: "",
            accountPhone: phoneNum,
            code: ""
          });
        } catch (e) {
          console.error("Failed to parse edit bank card data", e);
        }
      }
    } else {
      setForm(prev => ({ ...prev, accountPhone: phoneNum, mobileNumber: phoneNum }));
    }
  }, []);

  useEffect(() => {
    if (otpCountdown === 0) return;
    const interval = setInterval(() => {
      setOtpCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCountdown]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await addWithdrawAccount({
        type: "bank",
        accountName: form.actualName,
        accountNumber: form.bankAccount,
        ifsc: form.ifscCode,
        bankName: form.bankName,
        code: form.code,
        mobile: form.accountPhone,
      });
      sessionStorage.removeItem("edit_bank_card");

      setTimeout(() => {
        pushToast("success", "success");
        setTimeout(() => {
          router.back();
        }, 1500);
      }, 1000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to save bank card.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!form.accountPhone) {
      alert("Phone number not found.");
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: form.accountPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to send OTP");
      } else {
        setTimeout(() => {
          pushToast("success", "success");
          setOtpCountdown(180);
        }, 1000);
      }
    } catch (err) {
      alert("Failed to send OTP. Please check your network connection.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const inputClass = "w-full bg-transparent text-[13px] text-[#333] placeholder-[#adadad] outline-none border-none py-[14px]";

  return (
    <main className="min-h-screen bg-white pb-24 flex flex-col w-full max-w-none m-0 relative select-none">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm w-full">
        <button onClick={() => router.back()} className="text-white bg-transparent border-none outline-none flex items-center cursor-pointer p-0">
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </button>
        <span className="text-[17px] font-normal text-white tracking-wide">Add Bank Card</span>
      </nav>

      <form onSubmit={handleSubmit} className="flex flex-col w-full bg-white mt-1">
        <div className="w-full px-4"><input type="text" name="actualName" value={form.actualName} onChange={handleChange} placeholder="Actual Name" className={inputClass} required /></div>
        <div className="w-[calc(100%-2rem)] mx-auto h-[1px] bg-[#f0f0f0]"></div>

        <div className="w-full px-4"><input type="text" name="ifscCode" value={form.ifscCode} onChange={handleChange} placeholder="IFSC Code" className={inputClass} required /></div>
        <div className="w-[calc(100%-2rem)] mx-auto h-[1px] bg-[#f0f0f0]"></div>

        <div className="w-full px-4"><input type="text" name="bankName" value={form.bankName} onChange={handleChange} placeholder="Bank Name" className={inputClass} required /></div>
        <div className="w-[calc(100%-2rem)] mx-auto h-[1px] bg-[#f0f0f0]"></div>

        <div className="w-full px-4"><input type="text" name="bankAccount" value={form.bankAccount} onChange={handleChange} placeholder="Bank Account" className={inputClass} required /></div>
        <div className="w-[calc(100%-2rem)] mx-auto h-[1px] bg-[#f0f0f0]"></div>

        <div className="w-full px-4"><input type="text" name="usdtAddress" value={form.usdtAddress} onChange={handleChange} placeholder="USDT Address" className={inputClass} /></div>
        <div className="w-[calc(100%-2rem)] mx-auto h-[1px] bg-[#f0f0f0]"></div>

        <div className="w-full px-4"><input type="text" name="state" value={form.state} onChange={handleChange} placeholder="State/Territory" className={inputClass} /></div>
        <div className="w-[calc(100%-2rem)] mx-auto h-[1px] bg-[#f0f0f0]"></div>

        <div className="w-full px-4"><input type="text" name="city" value={form.city} onChange={handleChange} placeholder="City" className={inputClass} /></div>
        <div className="w-[calc(100%-2rem)] mx-auto h-[1px] bg-[#f0f0f0]"></div>

        <div className="w-full px-4"><input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Address" className={inputClass} /></div>
        <div className="w-[calc(100%-2rem)] mx-auto h-[1px] bg-[#f0f0f0]"></div>

        <div className="w-full px-4"><input type="text" name="mobileNumber" value={form.mobileNumber} placeholder="Mobile Number" className={inputClass + " opacity-60 cursor-not-allowed"} readOnly disabled /></div>
        <div className="w-[calc(100%-2rem)] mx-auto h-[1px] bg-[#f0f0f0]"></div>

        <div className="w-full px-4"><input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className={inputClass} /></div>
        <div className="w-[calc(100%-2rem)] mx-auto h-[1px] bg-[#f0f0f0]"></div>

        {/* Account Phone Number */}
        <div className="w-full px-4 pt-3 pb-2 flex flex-col">
          <span className="text-[12px] text-[#adadad] mb-[6px]">Account phone number</span>
          <span className="text-[14px] text-[#333] font-medium">{form.accountPhone}</span>
        </div>
        <div className="w-[calc(100%-2rem)] mx-auto h-[1px] bg-[#f0f0f0]"></div>

        {/* Verification Code */}
        <div className="w-full px-4 pt-3 pb-3 flex flex-row items-end justify-between border-b border-[#e5e5e5]">
          <div className="flex flex-col flex-1">
            <span className="text-[12px] text-[#adadad] mb-1">Code</span>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="Verification Code"
              className="w-full bg-transparent text-[13px] text-[#333] placeholder-[#adadad] outline-none border-none py-[2px]"
              required
            />
          </div>
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={otpCountdown > 0 || submitLoading}
            className="bg-[#fcfcfc] text-[#333] text-[13px] px-5 py-2 rounded-[2px] ml-4 shrink-0 border border-[#e5e5e5] cursor-pointer hover:bg-[#f0f0f0] transition-colors disabled:opacity-50"
          >
            {otpCountdown > 0 ? `${otpCountdown}s` : "OTP"}
          </button>
        </div>

        {/* Continue Button */}
        <div className="w-full flex justify-center mt-8 px-4">
          <button
            type="submit"
            disabled={submitLoading}
            className="w-full max-w-[600px] bg-[#009688] text-white py-[12px] rounded-[4px] font-normal text-[16px] border-none cursor-pointer hover:opacity-90 shadow-md disabled:opacity-50"
          >
            {"Continue"}
          </button>
        </div>
      </form>

      <BottomNav />
      <ToastStack toasts={toasts} />
    </main>
  );
}
