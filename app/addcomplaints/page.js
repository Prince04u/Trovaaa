"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/home/BottomNav";

export default function AddComplaintsPage() {
  const router = useRouter();
  const [type, setType] = useState("Out of money");
  const [outId, setOutId] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      alert("Complaint submitted successfully!");
      router.push("/complaints");
    } catch (err) {
      alert("Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#333333]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[48px] px-4 flex items-center gap-3 sticky top-0 z-10 shadow-none w-full">
        <Link href="/complaints" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[22px]">arrow_back</span>
        </Link>
        <span className="text-[17px] font-normal text-white ml-1">Add Complaints & Suggestion</span>
      </nav>

      <form onSubmit={handleSubmit} className="px-6 pt-6 flex flex-col w-full max-w-2xl mx-auto bg-white">
        {/* Type Field */}
        <div className="flex flex-col mb-8 relative">
          <label className="text-[13px] font-normal text-[#888888] mb-2">Type</label>
          <div className="relative flex items-center w-full">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full text-[14px] text-[#333333] border-b border-[#e0e0e0] pb-2 outline-none bg-transparent appearance-none cursor-pointer pr-8"
            >
              <option value="Out of money">Out of money</option>
              <option value="Recharge issue">Recharge issue</option>
              <option value="Withdrawal issue">Withdrawal issue</option>
              <option value="Suggestion">Suggestion</option>
              <option value="Other">Other</option>
            </select>
            <span className="material-icons-outlined text-[#888888] text-[20px] absolute right-0 pointer-events-none pb-2">
              arrow_drop_down
            </span>
          </div>
        </div>

        {/* Out Id Field */}
        <div className="flex flex-col mb-8">
          <label className="text-[13px] font-normal text-[#888888] mb-2">Out Id</label>
          <input
            type="text"
            value={outId}
            onChange={(e) => setOutId(e.target.value)}
            className="w-full text-[14px] text-[#333333] border-b border-[#e0e0e0] pb-2 outline-none bg-transparent"
          />
        </div>

        {/* WhatsApp Field */}
        <div className="flex flex-col mb-8">
          <label className="text-[13px] font-normal text-[#888888] mb-2">WhatsApp</label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full text-[14px] text-[#333333] border-b border-[#e0e0e0] pb-2 outline-none bg-transparent"
          />
        </div>

        {/* Description Field */}
        <div className="flex flex-col mb-10">
          <label className="text-[13px] font-normal text-[#888888] mb-2">Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-[14px] text-[#333333] border-b border-[#e0e0e0] pb-2 outline-none bg-transparent resize-y"
          />
        </div>

        {/* Service Note */}
        <div className="text-center text-[13px] font-normal text-[#666666] mb-6">
          Service: 10:00~17:00, Mon~Fri about 1~5 business days
        </div>

        {/* Submit Button */}
        <div className="flex justify-center w-full">
          <button
            type="submit"
            disabled={loading}
            className="w-[75%] max-w-[360px] py-2.5 bg-[#009688] text-white rounded-[4px] text-[15px] font-normal border-none cursor-pointer hover:bg-[#00897b] transition-colors shadow-none outline-none"
          >
            {loading ? "Submitting..." : "Continue"}
          </button>
        </div>
      </form>

      <BottomNav />
    </main>
  );
}
