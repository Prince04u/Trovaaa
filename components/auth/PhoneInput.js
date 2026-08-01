"use client";

export default function PhoneInput({ value, onChange, id = "mobile", name = "mobile", placeholder = "Mobile Number", required = true }) {
  return (
    <div className="van-card-input">
      <div className="w-[20px] flex items-center justify-center shrink-0" style={{ marginRight: '10px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
      </div>
      <input
        id={id}
        name={name}
        type="tel"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="flex-1 bg-transparent text-[16px] placeholder-[#adadad] outline-none border-none h-full font-normal shadow-none p-0"
        style={{ color: 'rgba(0,0,0,.87)' }}
      />
    </div>
  );
}

