"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

export default function LuckDrawPage() {
  const [spinning, setSpinning] = useState(false);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      alert("Congratulations! You won a gift bonus!");
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm w-full">
        <Link href="/account" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </Link>
        <span className="text-[17px] font-normal text-white">Luck Draw</span>
      </nav>

      {/* Wheel Container */}
      <div className="p-6 flex flex-col items-center justify-center gap-6 my-auto">
        <div className={`w-[260px] h-[260px] rounded-full border-8 border-[#009688] bg-white shadow-lg flex items-center justify-center relative transition-transform duration-3000 ${spinning ? "rotate-[1440deg]" : ""}`}>
          <div className="text-center font-bold text-[#009688] text-lg">
            Lucky Wheel
          </div>
        </div>

        <button
          type="button"
          onClick={handleSpin}
          disabled={spinning}
          className="bg-[#009688] text-white px-8 py-3 rounded-full font-bold text-base border-none cursor-pointer hover:opacity-90 shadow-md disabled:opacity-50"
        >
          {spinning ? "SPINNING..." : "START DRAW"}
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
