"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";
import { getProfile } from "@/lib/userApi";

export default function PromotionPage() {
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getProfile()
      .then((res) => {
        if (res?.success) setUser(res.data);
      })
      .catch(() => {});
  }, []);

  const referralCode = user?.uid || user?.id?.slice(-8).toUpperCase() || "";
  const referralLink = typeof window !== "undefined" && referralCode 
    ? `${window.location.origin}/register?ref=${referralCode}` 
    : "";

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm w-full">
        <div className="flex items-center gap-3">
          <Link href="/account" className="text-white text-decoration-none flex items-center">
            <span className="material-icons-outlined text-[24px]">arrow_back</span>
          </Link>
          <span className="text-[17px] font-normal text-white">Promotion</span>
        </div>
        <Link href="/reward" className="text-white text-decoration-none text-sm">
          Explain
        </Link>
      </nav>

      {/* Bonus Stats Header */}
      <div className="bg-[#009688] text-white p-6 flex flex-col items-center justify-center gap-2">
        <span className="text-sm opacity-90">Bonus</span>
        <strong className="text-3xl font-bold">₹ 0.00</strong>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-white m-4 rounded shadow-sm text-center">
        <div>
          <span className="text-xs text-gray-500 block mb-1">Total People</span>
          <strong className="text-lg text-[#333]">0</strong>
        </div>
        <div>
          <span className="text-xs text-gray-500 block mb-1">Contribution</span>
          <strong className="text-lg text-[#333]">₹ 0.00</strong>
        </div>
      </div>

      {/* Referral Link & Code Section */}
      <div className="p-4 bg-white m-4 rounded shadow-sm flex flex-col gap-3">
        <p className="text-sm font-medium text-gray-700 m-0">My Promotion Code: <strong className="text-[#009688]">{referralCode}</strong></p>
        <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded border border-gray-200">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="bg-transparent border-none text-xs text-gray-600 flex-grow outline-none"
          />
          <button
            type="button"
            onClick={copyLink}
            className="bg-[#009688] text-white text-xs px-3 py-1.5 rounded border-none cursor-pointer"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
