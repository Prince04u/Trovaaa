"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/home/BottomNav";
import { getUser } from "@/lib/auth";
import { useToasts, ToastStack } from "@/components/ui/Toast";

export default function RedEnvelopePage() {
  const router = useRouter();
  const { toasts, push } = useToasts();
  const [view, setView] = useState("list"); // "list" | "add"
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("••••••");

  useEffect(() => {
    const user = getUser();
    if (user?.mobile || user?.phone) {
      const p = user.mobile || user.phone;
      setPhone(p.startsWith("+") ? p : `+91${p}`);
    } else {
      setPhone("+919341225312"); // fallback like in screenshot
    }
  }, []);

  const handleLaunch = (e) => {
    e.preventDefault();
    push("You can't send a red envelope", "error");
  };

  return (
    <main className="min-h-screen bg-white pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#333] font-sans">
      {view === "list" ? (
        <>
          {/* Top Navbar */}
          <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 w-full">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push("/account")} 
                className="text-white bg-transparent border-none outline-none flex items-center cursor-pointer p-0"
              >
                <span className="material-icons-outlined text-[24px]">arrow_back</span>
              </button>
              <span className="text-[17px] font-normal text-white">RedEnvelope</span>
            </div>
            <button 
              onClick={() => setView("add")} 
              className="text-white bg-transparent border-none outline-none flex items-center cursor-pointer p-0"
            >
              <span className="material-icons-outlined text-[26px]">add</span>
            </button>
          </nav>

          {/* List Content */}
          <div className="flex flex-col flex-1 bg-white">
            <div className="py-8 text-center text-[#333] text-[13px] font-medium border-b border-[#eee]">
              No data available
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-4 bg-white text-[13px] text-[#999] border-b border-[#eee] md:justify-end md:gap-8">
              <div>1-10 of 0</div>
              <div className="flex items-center gap-6">
                <span className="material-icons-outlined text-[18px] text-[#ccc] cursor-pointer">keyboard_arrow_left</span>
                <span className="material-icons-outlined text-[18px] text-[#ccc] cursor-pointer">keyboard_arrow_right</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select className="bg-transparent border-b border-[#ccc] text-[#666] outline-none pb-1 text-[13px]" defaultValue="10" disabled>
                  <option value="10">10</option>
                </select>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Top Navbar */}
          <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 w-full">
            <button 
              onClick={() => setView("list")} 
              className="text-white bg-transparent border-none outline-none flex items-center cursor-pointer p-0"
            >
              <span className="material-icons-outlined text-[24px]">arrow_back</span>
            </button>
            <span className="text-[17px] font-normal text-white">Add Red Envelope</span>
          </nav>

          {/* Add Form */}
          <form onSubmit={handleLaunch} className="flex flex-col w-full bg-white px-4 py-6 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#adadad] font-normal">Fixed Mony</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#fffbeb] border-none outline-none py-2 px-3 text-[14px] text-[#333] rounded"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#adadad] font-normal">Enter Your Login Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#fffbeb] border-none outline-none py-2 px-3 text-[14px] text-[#333] rounded"
                required
              />
            </div>

            <div className="w-full flex justify-center mt-6">
              <button
                type="submit"
                className="w-full max-w-[600px] bg-[#009688] text-white py-3 rounded font-medium text-[16px] border-none cursor-pointer hover:opacity-90 shadow-md transition-opacity"
              >
                Launch
              </button>
            </div>
          </form>
        </>
      )}

      <BottomNav />
      <ToastStack toasts={toasts} />
    </main>
  );
}
