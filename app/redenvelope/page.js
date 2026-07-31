"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

export default function RedEnvelopePage() {
  const [code, setCode] = useState("");

  const handleRedeem = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      alert("Please enter red envelope code");
      return;
    }
    alert("Red envelope code submitted!");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm w-full">
        <Link href="/account" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </Link>
        <span className="text-[17px] font-normal text-white">Red Envelope</span>
      </nav>

      <form onSubmit={handleRedeem} className="p-4 flex flex-col gap-4 bg-white m-4 rounded shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Red Envelope Code</label>
          <input
            type="text"
            placeholder="Enter Red Envelope Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border-b border-[#009688] py-2 text-base outline-none text-[#333]"
            required
          />
        </div>

        <button
          type="submit"
          className="mt-2 bg-[#009688] text-white py-3 rounded font-medium text-[15px] border-none cursor-pointer hover:opacity-90"
        >
          Redeem
        </button>
      </form>

      <BottomNav />
    </main>
  );
}
