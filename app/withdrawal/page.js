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
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm w-full">
        <div className="flex items-center gap-3">
          <Link href="/account" className="text-white text-decoration-none flex items-center">
            <span className="material-icons-outlined text-[24px]">arrow_back</span>
          </Link>
          <span className="text-[17px] font-normal text-white">Withdrawal</span>
        </div>
        <Link href="/withdrawalrecord" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[22px]">history</span>
        </Link>
      </nav>

      <form onSubmit={handleWithdrawal} className="p-4 flex flex-col gap-4 w-full">
        <div className="bg-white p-4 rounded shadow-sm flex flex-col gap-2">
          <span className="text-sm text-gray-500">Balance: </span>
          <strong className="text-xl text-[#009688]">₹ 0.00</strong>
        </div>

        <div className="bg-white p-4 rounded shadow-sm flex flex-col gap-3">
          <label className="text-sm text-gray-600">Enter Amount</label>
          <input
            type="number"
            placeholder="Enter withdrawal amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border-b border-[#009688] py-2 text-lg outline-none font-bold text-[#333]"
            required
          />

          <label className="text-sm text-gray-600 mt-2">Select Bank Card</label>
          <Link href="/addbankcard" className="text-xs text-[#009688] text-decoration-none">
            + Add Bank Card
          </Link>

          <label className="text-sm text-gray-600 mt-2">Enter Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-b border-[#009688] py-2 text-base outline-none text-[#333]"
            required
          />
        </div>

        <button
          type="submit"
          className="mt-2 bg-[#009688] text-white py-3.5 rounded font-medium text-[16px] border-none cursor-pointer hover:opacity-90 shadow-sm"
        >
          Withdrawal
        </button>
      </form>

      <BottomNav />
    </main>
  );
}
