"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/home/BottomNav";
import { useToasts, ToastStack } from "@/components/ui/Toast";

export default function AddAddressPage() {
  const router = useRouter();
  const { toasts, push: pushToast } = useToasts();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    pushToast("Address added successfully!", "success");
    setTimeout(() => {
      router.push("/address");
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm w-full">
        <Link href="/address" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </Link>
        <span className="text-[17px] font-normal text-white">Add Address</span>
      </nav>

      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3 bg-white m-4 rounded shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-[#555555]">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-b border-[#009688] py-2 text-[15px] outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-[#555555]">Mobile Number</label>
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="border-b border-[#009688] py-2 text-[15px] outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-[#555555]">Pincode</label>
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className="border-b border-[#009688] py-2 text-[15px] outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-[#555555]">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="border-b border-[#009688] py-2 text-[15px] outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-[#555555]">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border-b border-[#009688] py-2 text-[15px] outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[14px] text-[#555555]">Detail Address</label>
          <input
            type="text"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
            className="border-b border-[#009688] py-2 text-[15px] outline-none"
            required
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
      <ToastStack toasts={toasts} />
    </main>
  );
}
