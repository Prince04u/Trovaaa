"use client";

export default function PhoneInput({ value, onChange, id = "mobile", name = "mobile", placeholder = "Mobile Number", required = true }) {
  return (
    <div className="w-full flex items-center gap-[12px] border border-[#e4e4e4] rounded-[2px] bg-white px-[14px] h-[48px] focus-within:border-[#00A091] transition-colors select-none box-border">
      <div className="w-[20px] flex items-center justify-center shrink-0">
        <span className="material-icons-outlined text-[20px] text-[#888888]">smartphone</span>
      </div>
      <input
        id={id}
        name={name}
        type="tel"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="flex-1 bg-transparent text-[14px] text-[#222222] placeholder-[#adadad] outline-none border-none h-full font-normal shadow-none p-0"
      />
    </div>
  );
}
