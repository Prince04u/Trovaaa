"use client";

export default function PasswordInput({ id = "password", name = "password", value, onChange, placeholder = "Password", required = true, minLength }) {
  return (
    <div className="van-card-input">
      <div className="w-[20px] flex items-center justify-center shrink-0" style={{ marginRight: '10px' }}>
        <img src="/img/mm.png" alt="Password" width="20" height="20" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='inline'; }} />
        <span className="material-icons-outlined text-[20px] text-[#888888]" style={{display:'none'}}>vpn_key</span>
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
