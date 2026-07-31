"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState(0); // 0: ALL, 1: UNDELIVER, 2: UNRECEIVE, 3: SUCCESS
  const [orders] = useState([]);

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm w-full">
        <Link href="/account" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </Link>
        <span className="text-[17px] font-normal text-white">Orders</span>
      </nav>

      {/* Tabs */}
      <div className="bg-white flex border-b border-gray-200 select-none w-full">
        {["ALL", "UNDELIVER", "UNRECEIVE", "SUCCESS"].map((tab, idx) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`flex-1 py-3 text-center text-[13px] font-medium border-none bg-transparent cursor-pointer ${
              activeTab === idx ? "text-[#009688] border-b-2 border-[#009688]" : "text-[#888888]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 w-full text-center">
        {orders.length === 0 ? (
          <div className="py-16 text-gray-400 text-[14px]">No data available</div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((o, i) => (
              <div key={i} className="bg-white p-4 rounded shadow-sm text-left">
                <p className="font-bold text-[#009688]">Order #{o.id}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
