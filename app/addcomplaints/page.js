"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/home/BottomNav";

export default function AddComplaintsPage() {
  const router = useRouter();
  const [type, setType] = useState("Out of money");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Complaint submitted successfully!");
    router.push("/complaints");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm w-full">
        <Link href="/complaints" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </Link>
        <span className="text-[17px] font-normal text-white">Add Complaints & Suggestions</span>
      </nav>

      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 bg-white m-4 rounded shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-[#555555]">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border-b border-[#009688] py-2 text-[15px] outline-none bg-transparent"
          >
            <option value="Out of money">Out of money</option>
            <option value="Recharge issue">Recharge issue</option>
            <option value="Withdrawal issue">Withdrawal issue</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-[#555555]">Out of money WhatsApp</label>
          <input
            type="text"
            placeholder="WhatsApp Number"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="border-b border-[#009688] py-2 text-[15px] outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-[#555555]">Description</label>
          <textarea
            rows={4}
            placeholder="Please enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-[#e0e0e0] rounded p-2 text-[15px] outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-[#009688] text-white py-3 rounded font-medium text-[15px] border-none cursor-pointer hover:opacity-90"
        >
          Submit
        </button>
      </form>

      <BottomNav />
    </main>
  );
}
