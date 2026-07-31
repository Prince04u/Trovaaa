"use client";

import { Smartphone } from "lucide-react";

export default function PhoneInput({ value, onChange, id = "mobile", name = "mobile", placeholder = "Mobile Number" }) {
  return (
    <div className="w-full flex items-center gap-3.5 border border-[#E5E5E5] rounded-[2px] bg-white px-4 h-[48px] md:h-[52px] focus-within:border-[#009688] transition-colors select-none shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <Smartphone size={20} className="text-[#8A8A8A] shrink-0" strokeWidth={1.75} />
      <input
        id={id}
        name={name}
        type="tel"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="flex-grow bg-transparent text-[15px] md:text-[16px] text-[#222222] placeholder-[#8A8A8A] outline-none focus:outline-none focus:ring-0 focus:border-none border-none h-full font-normal shadow-none"
      />
    </div>
  );
}
