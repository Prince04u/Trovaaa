"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/home/BottomNav";

export default function AddBankCardPage() {
  const router = useRouter();
  const [actualname, setActualname] = useState("");
  const [ifsccode, setIfsccode] = useState("");
  const [bankname, setBankname] = useState("");
  const [bankaccount, setBankaccount] = useState("");
  const [usdtAddress, setUsdtAddress] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Bank Card added successfully!");
    router.push("/bankcard");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm w-full">
        <Link href="/bankcard" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </Link>
        <span className="text-[17px] font-normal text-white">Add Bank Card</span>
      </nav>

      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3 bg-white m-4 rounded shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-[#555555]">Actual Name</label>
          <input
            type="text"
            value={actualname}
            onChange={(e) => setActualname(e.target.value)}
            className="border-b border-[#009688] py-2 text-[15px] outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-[#555555]">IFSC Code</label>
          <input
            type="text"
            value={ifsccode}
            onChange={(e) => setIfsccode(e.target.value)}
            className="border-b border-[#009688] py-2 text-[15px] outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-[#555555]">Bank Name</label>
          <input
            type="text"
            value={bankname}
            onChange={(e) => setBankname(e.target.value)}
            className="border-b border-[#009688] py-2 text-[15px] outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-[#555555]">Bank Account</label>
          <input
            type="text"
            value={bankaccount}
            onChange={(e) => setBankaccount(e.target.value)}
            className="border-b border-[#009688] py-2 text-[15px] outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-[#555555]">USDT Address</label>
          <input
            type="text"
            value={usdtAddress}
            onChange={(e) => setUsdtAddress(e.target.value)}
            className="border-b border-[#009688] py-2 text-[15px] outline-none"
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-[#009688] text-white py-3 rounded font-medium text-[15px] border-none cursor-pointer hover:opacity-90"
        >
          Save
        </button>
      </form>

      <BottomNav />
    </main>
  );
}
