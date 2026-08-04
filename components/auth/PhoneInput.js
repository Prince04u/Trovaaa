"use client";

import { PHONE_ICON_B64 } from "@/components/auth/AuthIconsData";

export default function PhoneInput({ value, onChange, id = "mobile", name = "mobile", placeholder = "Mobile Number", required = true }) {
  return (
    <div className="van-card-input">
      <div className="w-[20px] flex items-center justify-center shrink-0" style={{ marginRight: '10px' }}>
        <img src={PHONE_ICON_B64} alt="Mobile Number" width="20" height="20" style={{ display: 'block', width: '20px', height: '20px' }} />
      </div>
      <input
        id={id}
        name={name}
        type="tel"
        value={value}
        onChange={onChange}
        onFocus={(e) => {
          if (!value && onChange) {
            onChange({ target: { name, value: "+91" } });
          }
        }}
        placeholder={placeholder}
        required={required}
        className="flex-1 bg-transparent text-[16px] placeholder-[#adadad] outline-none border-none h-full font-normal shadow-none p-0"
        style={{ color: 'rgba(0,0,0,.87)' }}
      />
    </div>
  );
}



