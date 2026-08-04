"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

export default function WithdrawalPage() {
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");

  const handleWithdrawal = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert("Enter valid withdrawal amount");
      return;
    }
    alert(`Withdrawal request for ₹${amount} submitted!`);
  };

  return (
    <main className="min-h-screen bg-white pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#333]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm w-full">
        <div className="flex items-center gap-4">
          <Link href="/account" className="text-white text-decoration-none flex items-center">
            <span className="material-icons-outlined text-[24px]">arrow_back</span>
          </Link>
          <span className="text-[17px] font-normal text-white">Withdrawal</span>
        </div>
        <button type="button" className="text-white bg-transparent border-none outline-none flex items-center p-0 cursor-pointer">
          <span className="material-icons-outlined text-[24px]">menu</span>
        </button>
      </nav>

      <div className="p-4 flex flex-col gap-5 w-full max-w-xl mx-auto mt-2">
        {/* Balance Display */}
        <div className="text-center">
          <span className="text-xl text-[#333]">Balance: ₹ </span>
        </div>

        {/* Input */}
        <div>
          <div className="flex items-center bg-white rounded-md p-3 border border-gray-100" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
            <span className="material-icons-outlined text-gray-500 mr-2 text-[20px]">credit_card</span>
            <input
              type="number"
              placeholder="Enter withdrawal amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-sm outline-none font-normal text-[#333] bg-transparent border-none"
            />
          </div>
          <div className="text-sm text-[#333] mt-4 ml-1">Fee: 0,to account 0</div>
        </div>

        {/* Payout Methods */}
        <div className="flex flex-col mt-2">
          <span className="text-sm text-gray-500 mb-4 ml-1">Payout</span>
          
          <label className="flex items-center gap-8 py-2 cursor-pointer">
            <div className="w-5 flex justify-center">
              <span className="material-icons-outlined text-[#333] text-[20px]">check</span>
            </div>
            <span className="text-[15px] text-[#333]">Bankcard</span>
          </label>
        </div>

        {/* Details Form */}
        <div className="flex flex-col mt-4">
          <Link href="/addbankcard" className="flex items-center justify-between py-4 text-decoration-none text-[#333]" style={{ borderBottom: "1px solid #f0f0f0" }}>
            <div className="flex items-center gap-3">
              <span className="material-icons-outlined text-gray-500 text-[22px]">credit_card</span>
              <span className="text-[14px]">Select Bank Card</span>
            </div>
            <span className="material-icons-outlined text-gray-400 text-[20px]">chevron_right</span>
          </Link>
          
          <div className="flex items-center gap-3 py-4" style={{ borderBottom: "1px solid #f0f0f0" }}>
            <span className="material-icons-outlined text-gray-500 text-[22px]">vpn_key</span>
            <input
              type="password"
              placeholder="Enter your login password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 text-[14px] outline-none font-normal text-[#333] bg-transparent border-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleWithdrawal}
          className="mt-6 bg-[#009688] text-white py-3.5 rounded-sm font-normal text-[16px] border-none cursor-pointer hover:opacity-90 w-full"
        >
          Withdrawal
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
