"use client";

import { KEY_ICON_B64 } from "@/components/auth/AuthIconsData";

export default function PasswordInput({ id = "password", name = "password", value, onChange, placeholder = "Password", required = false, minLength }) {
  return (
    <div className="van-card-input">
      <div className="w-[20px] flex items-center justify-center shrink-0" style={{ marginRight: '10px' }}>
        <img src={KEY_ICON_B64} alt="Password" width="20" height="20" style={{ display: 'block', width: '20px', height: '20px' }} />
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
        className="flex-1 bg-transparent text-[16px] placeholder-[#adadad] outline-none border-none h-full font-normal shadow-none p-0"
        style={{ color: 'rgba(0,0,0,.87)' }}
      />
    </div>
  );
}



