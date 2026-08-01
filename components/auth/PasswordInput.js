"use client";

export default function PasswordInput({ id = "password", name = "password", value, onChange, placeholder = "Password", required = true, minLength }) {
  return (
    <div className="van-card-input">
      <div className="w-[20px] flex items-center justify-center shrink-0" style={{ marginRight: '10px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6.5" cy="12" r="3.5" />
          <path d="M10 12H19" />
          <path d="M15 12V15" />
          <path d="M18 12V15" />
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
        className="flex-1 bg-transparent text-[16px] placeholder-[#adadad] outline-none border-none h-full font-normal shadow-none p-0"
        style={{ color: 'rgba(0,0,0,.87)' }}
      />
    </div>
  );
}

