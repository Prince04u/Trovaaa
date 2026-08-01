"use client";

export default function PasswordInput({ id = "password", name = "password", value, onChange, placeholder = "Password", required = true, minLength }) {
  return (
    <div className="van-card-input">
      <div className="w-[20px] flex items-center justify-center shrink-0 mr-[12px]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <circle cx="7.5" cy="12" r="4" />
          <path d="M11.5 12H20" />
          <path d="M16 12V15" />
          <path d="M19 12V15" />
        </svg>
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
        className="flex-1 bg-transparent text-[14px] text-[#222222] placeholder-[#adadad] outline-none border-none h-full font-normal shadow-none p-0"
      />
    </div>
  );
}
