"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

export default function RechargePage() {
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("WinPay");

  const PRESETS = [500, 1000, 2000, 5000, 10000, 49999];

  const handleRecharge = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert("Enter or Select recharge amount");
      return;
    }
    alert(`Recharge request for ₹${amount} via ${paymentType} submitted!`);
  };

  return (
    <main className="min-h-screen bg-white pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#333]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm w-full">
        <div className="flex items-center gap-4">
          <Link href="/account" className="text-white text-decoration-none flex items-center">
            <span className="material-icons-outlined text-[24px]">arrow_back</span>
          </Link>
          <span className="text-[17px] font-normal text-white">Recharge</span>
        </div>
        <button type="button" className="text-white bg-transparent border-none outline-none flex items-center p-0 cursor-pointer">
          <span className="material-icons-outlined text-[24px]">menu</span>
        </button>
      </nav>

      <div className="p-4 flex flex-col gap-6 w-full max-w-xl mx-auto mt-2">
        {/* Balance Display */}
        <div className="text-center">
          <span className="text-xl text-[#333]">Balance: ₹ </span>
        </div>

        {/* Input */}
        <div className="flex items-center bg-white rounded-md p-3 border border-gray-100" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          <span className="material-icons-outlined text-gray-500 mr-2 text-[20px]">account_balance_wallet</span>
          <input
            type="number"
            placeholder="Enter or Select recharge amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 text-sm outline-none font-normal text-[#333] bg-transparent border-none"
          />
        </div>

        {/* Presets Grid */}
        <div className="grid grid-cols-2 gap-4">
          {PRESETS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(String(val))}
              className={`py-3 rounded-md text-sm cursor-pointer border-none font-normal bg-[#fafafa] transition-colors`}
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)", color: amount === String(val) ? "#009688" : "#333" }}
            >
              ₹ {val}
            </button>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="flex flex-col mt-2">
          <span className="text-sm text-gray-500 mb-4 ml-1">Payment</span>
          
          <label className="flex items-center gap-8 py-3 cursor-pointer">
            <div className="w-5 flex justify-center">
              {paymentType === "WinPay" ? (
                <span className="material-icons-outlined text-[#333] text-[20px]">check</span>
              ) : null}
            </div>
            <span className="text-[15px] text-[#333]">WinPay</span>
            <input
              type="radio"
              name="payment"
              checked={paymentType === "WinPay"}
              onChange={() => setPaymentType("WinPay")}
              className="hidden"
            />
          </label>
          
          <label className="flex items-center gap-8 py-3 cursor-pointer">
            <div className="w-5 flex justify-center">
              {paymentType === "Dypay" ? (
                <span className="material-icons-outlined text-[#333] text-[20px]">check</span>
              ) : null}
            </div>
            <span className="text-[15px] text-[#333]">Dypay</span>
            <input
              type="radio"
              name="payment"
              checked={paymentType === "Dypay"}
              onChange={() => setPaymentType("Dypay")}
              className="hidden"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleRecharge}
          className="mt-4 bg-[#009688] text-white py-3.5 rounded-sm font-normal text-[16px] border-none cursor-pointer hover:opacity-90 w-full"
        >
          Recharge
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
