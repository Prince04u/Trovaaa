"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

export default function RechargePage() {
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("0");

  const PRESETS = [500, 1000, 2000, 5000, 10000, 50000];

  const handleRecharge = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert("Enter or Select recharge amount");
      return;
    }
    alert(`Recharge request for ₹${amount} submitted!`);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm w-full">
        <div className="flex items-center gap-3">
          <Link href="/account" className="text-white text-decoration-none flex items-center">
            <span className="material-icons-outlined text-[24px]">arrow_back</span>
          </Link>
          <span className="text-[17px] font-normal text-white">Recharge</span>
        </div>
        <Link href="/rechargerecord" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[22px]">history</span>
        </Link>
      </nav>

      <div className="p-4 flex flex-col gap-4 w-full">
        {/* Balance Display */}
        <div className="bg-white p-4 rounded shadow-sm text-center">
          <span className="text-sm text-gray-500">Balance: </span>
          <strong className="text-xl text-[#009688]">₹ 0.00</strong>
        </div>

        {/* Input & Presets */}
        <div className="bg-white p-4 rounded shadow-sm flex flex-col gap-3">
          <label className="text-sm text-gray-600">Enter Amount</label>
          <input
            type="number"
            placeholder="Enter or Select recharge amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border-b border-[#009688] py-2 text-lg outline-none font-bold text-[#333]"
          />

          <div className="grid grid-cols-3 gap-2.5 mt-2">
            {PRESETS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(String(val))}
                className={`py-2 rounded border text-sm font-medium cursor-pointer ${
                  amount === String(val)
                    ? "bg-[#009688] text-white border-[#009688]"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                ₹ {val}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-4 rounded shadow-sm flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-700 mb-1">Payment Method</span>
          {["UPI Pay", "Paytm", "Bank Transfer"].map((name, idx) => (
            <label key={name} className="flex items-center gap-3 py-2 cursor-pointer border-b border-gray-100">
              <input
                type="radio"
                name="payment"
                checked={paymentType === String(idx)}
                onChange={() => setPaymentType(String(idx))}
                className="accent-[#009688]"
              />
              <span className="text-sm text-gray-700">{name}</span>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={handleRecharge}
          className="mt-2 bg-[#009688] text-white py-3.5 rounded font-medium text-[16px] border-none cursor-pointer hover:opacity-90 shadow-sm"
        >
          Recharge
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
