"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

export default function BankCardPage() {
  const [bankCards] = useState([]);

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm w-full">
        <div className="flex items-center gap-3">
          <Link href="/account" className="text-white text-decoration-none flex items-center">
            <span className="material-icons-outlined text-[24px]">arrow_back</span>
          </Link>
          <span className="text-[17px] font-normal text-white">Bank Card</span>
        </div>
        <Link href="/addbankcard" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[24px]">add</span>
        </Link>
      </nav>

      <div className="p-4 w-full">
        {bankCards.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-[14px]">No bank card added</div>
        ) : (
          <div className="flex flex-col gap-3">
            {bankCards.map((card, idx) => (
              <div key={idx} className="bg-white p-4 rounded shadow-sm border border-gray-200">
                <p className="font-bold text-[#333]">{card.bankname}</p>
                <p className="text-sm text-gray-600">{card.bankaccount}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
