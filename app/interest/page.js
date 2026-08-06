"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

export default function InterestPage() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm w-full">
        <div className="flex items-center gap-3">
          <Link href="/account" className="text-white text-decoration-none flex items-center">
            <span className="material-icons-outlined text-[24px]">arrow_back</span>
          </Link>
          <span className="text-[17px] font-normal text-white">Interest</span>
        </div>
        <button
          type="button"
          onClick={() => setShowInfo(true)}
          className="w-6 h-6 rounded-full border border-white text-white flex items-center justify-center font-bold text-xs bg-transparent cursor-pointer"
        >
          ?
        </button>
      </nav>

      <div className="p-4 w-full text-center">
        <div className="py-16 text-gray-400 text-[14px]">No data available</div>
      </div>

      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] w-full max-w-[480px] p-6 shadow-lg flex flex-col justify-between">
            <h3 className="text-[18px] font-medium text-[#222222] m-0 mb-3">Explain</h3>
            <p className="text-[14px] text-[#555555] m-0 mb-6 leading-relaxed">
              Interest rules:
              1. The account balance is greater than 500 to generate interest
              2. Settlement time is 12:00 every day, and the profit amount enters the balance account
              3. Interest amount 1000*0.008=8
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="bg-transparent border-none text-[#009688] font-medium text-[14px] cursor-pointer outline-none"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
