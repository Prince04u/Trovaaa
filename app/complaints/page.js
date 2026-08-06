"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

export default function ComplaintsPage() {
  const [activeTab, setActiveTab] = useState(2); // 2 = COMPLETED, 1 = WAIT
  const [complaints] = useState([]);

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm w-full">
        <div className="flex items-center gap-3">
          <Link href="/account" className="text-white text-decoration-none flex items-center">
            <span className="material-icons-outlined text-[24px]">arrow_back</span>
          </Link>
          <span className="text-[17px] font-normal text-white">Complaints & Suggestions</span>
        </div>
        <Link href="/addcomplaints" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[24px]">add</span>
        </Link>
      </nav>

      {/* Tabs Header */}
      <div className="bg-white flex border-b border-gray-200 relative select-none w-full">
        <button
          type="button"
          onClick={() => setActiveTab(2)}
          className={`flex-1 py-3 text-center text-[15px] font-medium border-none bg-transparent cursor-pointer ${
            activeTab === 2 ? "text-[#009688]" : "text-[#888888]"
          }`}
        >
          COMPLETED
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(1)}
          className={`flex-1 py-3 text-center text-[15px] font-medium border-none bg-transparent cursor-pointer ${
            activeTab === 1 ? "text-[#009688]" : "text-[#888888]"
          }`}
        >
          WAIT
        </button>
        <div
          className="absolute bottom-0 h-[2px] bg-[#009688] transition-all duration-200 w-1/2"
          style={{ left: activeTab === 2 ? "0%" : "50%" }}
        />
      </div>

      {/* Content */}
      <div className="p-4 w-full text-center">
        {complaints.length === 0 ? (
          <div className="py-16 text-gray-400 text-[14px]">No data available</div>
        ) : (
          <div className="flex flex-col gap-3">
            {complaints.map((c) => (
              <div key={c.id} className="bg-white p-4 rounded shadow-sm text-left">
                <p className="font-bold text-[#009688]">{c.type_name}</p>
                <p className="text-gray-600 text-sm">WhatsApp: {c.whatsapp}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
