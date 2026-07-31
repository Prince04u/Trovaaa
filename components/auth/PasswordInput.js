"use client";

import { KeyRound } from "lucide-react";

export default function PasswordInput({ id, name, value, onChange, placeholder = "Password", required = true, minLength }) {
  return (
    <div className="w-full flex items-center gap-[14px] border border-[#e4e4e4] rounded-[2px] bg-white pl-[12px] pr-[16px] h-[48px] focus-within:border-[#00A091] transition-colors select-none shadow-[0_2px_4px_rgba(0,0,0,0.20)] box-border">
      <div className="w-[22px] flex items-center justify-center shrink-0">
        <KeyRound size={22} className="text-[#7d7d7d]" strokeWidth={1.5} />
      </div>
      <input
        id={id}
        name={name}
        type="password"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="flex-1 bg-transparent text-[16px] text-[#222222] placeholder-[#adadad] outline-none focus:outline-none focus:ring-0 focus:border-none border-none h-full font-normal shadow-none p-0"
      />
    </div>
  );
}
