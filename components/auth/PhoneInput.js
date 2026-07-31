"use client";

import { Smartphone } from "lucide-react";

export default function PhoneInput({ value, onChange, id = "mobile", name = "mobile", placeholder = "Mobile Number" }) {
  return (
    <div className="flex items-center gap-3 border border-[#E0E0E0] rounded-[4px] bg-white px-3.5 py-2 h-[46px] focus-within:border-[#009688] transition-colors select-none">
      <Smartphone size={18} className="text-[#9E9E9E] shrink-0" strokeWidth={1.75} />
      <input
        id={id}
        name={name}
        type="tel"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="flex-grow bg-transparent text-sm text-[#222222] placeholder-[#9E9E9E] outline-none border-none h-full font-normal"
      />
    </div>
  );
}
