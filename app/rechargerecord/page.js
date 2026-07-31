"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

export default function RechargeRecordPage() {
  const [records] = useState([]);

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm w-full">
        <Link href="/recharge" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </Link>
        <span className="text-[17px] font-normal text-white">Recharge Record</span>
      </nav>

      <div className="p-4 w-full text-center">
        {records.length === 0 ? (
          <div className="py-16 text-gray-400 text-[14px]">No data available</div>
        ) : (
          <div className="flex flex-col gap-3">
            {records.map((r, i) => (
              <div key={i} className="bg-white p-4 rounded shadow-sm text-left">
                <p className="font-bold text-[#009688]">₹ {r.money}</p>
                <p className="text-xs text-gray-500">{r.status === 1 ? "Success" : "Unpaid"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
