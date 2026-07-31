"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BottomNav from "@/components/home/BottomNav";
import { clearAuth, getToken } from "@/lib/auth";
import { getBalance } from "@/lib/walletApi";
import { getProfile } from "@/lib/userApi";
import { disconnectSocket } from "@/lib/socket";

// Exact Custom SVGs matching uploaded reference icons
const PouchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#00A091" className="shrink-0">
    <path d="M12 2C10.5 3.2 9.5 3.8 8 4.2C7 4.5 5 3.8 5 3.8L6.8 7.5C3.5 10 2.5 13.5 3.5 17C4.5 20.5 7.5 22 12 22C16.5 22 19.5 20.5 20.5 17C21.5 13.5 20.5 10 17.2 7.5L19 3.8C19 3.8 17 4.5 16 4.2C14.5 3.8 13.5 3.2 12 2Z" />
    <text x="12" y="15.5" fontSize="8" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="sans-serif">₹</text>
  </svg>
);

const OrdersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7b7b7b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
    <circle cx="7.5" cy="8.5" r="0.75" fill="#7b7b7b" />
    <line x1="10.5" y1="8.5" x2="17.5" y2="8.5" />
    <circle cx="7.5" cy="12" r="0.75" fill="#7b7b7b" />
    <line x1="10.5" y1="12" x2="17.5" y2="12" />
    <circle cx="7.5" cy="15.5" r="0.75" fill="#7b7b7b" />
    <line x1="10.5" y1="15.5" x2="17.5" y2="15.5" />
  </svg>
);

const SignInIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7b7b7b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <line x1="8" y1="2.5" x2="8" y2="5.5" />
    <line x1="16" y1="2.5" x2="16" y2="5.5" />
    <line x1="3.5" y1="9" x2="20.5" y2="9" />
    <path d="M8 14.5l2.8 2.8 5.2-5.2" />
  </svg>
);

const WalletIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#7b7b7b" className="shrink-0">
    <path d="M4 4h14a2 2 0 0 1 2 2v2H12a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h8v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    <path d="M12 10h10v4H12a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" fill="#ffffff" />
    <circle cx="16" cy="12" r="1" fill="#7b7b7b" />
  </svg>
);

const AddressIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#7b7b7b" className="shrink-0">
    <path d="M9 2h6a1 1 0 0 1 1 1v18H8V3a1 1 0 0 1 1-1zM3 9h5v12H3a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1z" />
    <rect x="11" y="5" width="2" height="1.5" rx="0.5" fill="#ffffff" />
    <rect x="11" y="8" width="2" height="1.5" rx="0.5" fill="#ffffff" />
    <rect x="11" y="11" width="2" height="1.5" rx="0.5" fill="#ffffff" />
    <rect x="11" y="14" width="2" height="1.5" rx="0.5" fill="#ffffff" />
    <rect x="4" y="11" width="2" height="1.5" rx="0.5" fill="#ffffff" />
    <rect x="4" y="14" width="2" height="1.5" rx="0.5" fill="#ffffff" />
  </svg>
);

const AboutIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#7b7b7b" className="shrink-0">
    <path d="M4 3h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2z" />
    <circle cx="12" cy="8" r="1" fill="#ffffff" />
    <rect x="11" y="11" width="2" height="5" rx="0.5" fill="#ffffff" />
  </svg>
);

const FeedbackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#7b7b7b" className="shrink-0">
    <path d="M4 3h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2z" />
    <rect x="7" y="8" width="10" height="2" rx="1" fill="#ffffff" />
    <rect x="7" y="12" width="10" height="2" rx="1" fill="#ffffff" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#7b7b7b" className="shrink-0">
    <path d="M12 3v10m0 0l-5-5m5 5l5-5" stroke="#7b7b7b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="4" y="18" width="16" height="2.5" rx="0.5" fill="#7b7b7b" />
  </svg>
);

const SecurityIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#7b7b7b" className="shrink-0">
    <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12c4.16-1.26 8-6.45 8-12V5l-8-3z" />
    <path d="M12 2v20c4.16-1.26 8-6.45 8-12V5l-8-3z" fill="#666666" />
    <path d="M6 7.5h6V12H6z" fill="#ffffff" />
    <path d="M12 12h6v4.5c0 2.5-1.5 5-3.5 6.2L12 22V12z" fill="#ffffff" />
  </svg>
);

const BankCardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7b7b7b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" stroke="#7b7b7b" />
    <rect x="14" y="13" width="4" height="3" rx="0.5" fill="#7b7b7b" stroke="none" />
  </svg>
);

const GiftIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7b7b7b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <rect x="3" y="10" width="18" height="11" rx="1" />
    <path d="M12 10v11" />
    <rect x="2" y="7" width="20" height="3" rx="0.5" />
    <path d="M12 7c-1.5-1.5-3-2.5-4.5-1A2.5 2.5 0 0 0 11 9.5" fill="none" />
    <path d="M12 7c1.5-1.5 3-2.5 4.5-1A2.5 2.5 0 0 1 13 9.5" fill="none" />
  </svg>
);

export default function AccountScreen() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUserState] = useState(null);
  const [balance, setBalance] = useState(0);
  const [showNotice, setShowNotice] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      if (res?.success) setUserState(res.data);
    } catch {}
  };

  const loadBalance = async () => {
    try {
      const res = await getBalance();
      if (res?.success) setBalance(res.data.balance);
    } catch {}
  };

  useEffect(() => {
    const init = async () => {
      if (getToken()) {
        await Promise.all([loadProfile(), loadBalance()]);
      }
      setMounted(true);
    };
    init();
  }, []);

  const handleLogout = () => {
    disconnectSocket();
    clearAuth();
    router.replace("/login");
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#fafafa] w-full flex items-center justify-center">
        <div className="text-sm text-gray-400 font-normal">Loading...</div>
      </main>
    );
  }

  const displayName = user?.mobile || user?.name || "Player";
  const uid = user?.uid || user?.id?.slice(-8).toUpperCase() || "E348357";
  const avatarChar = displayName.charAt(0) || "P";

  const menuItems = [
    { label: "Sign In", href: "/account/vip", customIcon: <SignInIcon />, hasChevron: true },
    { label: "Orders", href: "/games/history", customIcon: <OrdersIcon />, hasChevron: true },
    { label: "Promotion", href: "/referral", customIcon: <GiftIcon />, hasChevron: true },
    { label: "Red Envelope", href: "/account/gifts", customIcon: <PouchIcon />, hasChevron: false },
    { label: "Luck Draw", href: "/promo", customIcon: <PouchIcon />, hasChevron: true },
    { label: "Wallet", href: "/wallet", customIcon: <WalletIcon />, hasChevron: true },
    { label: "Bank Card", href: "/wallet/withdraw/accounts", customIcon: <BankCardIcon />, hasChevron: true },
    { label: "Address", href: "/account/profile", customIcon: <AddressIcon />, hasChevron: true },
    { label: "Account Security", href: "/account/security", customIcon: <SecurityIcon />, hasChevron: true },
    { label: "App Download", href: "/account/guide", customIcon: <DownloadIcon />, hasChevron: true },
    { label: "Complaints & Suggestions", href: "/account/feedback", customIcon: <FeedbackIcon />, hasChevron: true },
    { label: "About", href: "/about", customIcon: <AboutIcon />, hasChevron: true },
  ];

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Profile Header Banner matching reference screenshot 2 */}
      <section className="bg-[#009F8F] text-white px-[21px] pt-[12px] pb-[16px] min-h-[175px] flex flex-col justify-between relative select-none w-full box-border shadow-sm">
        {/* User identification top bar with top-right bell button */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-[20px]">
            <div className="w-[40px] h-[40px] rounded-full bg-[#9DE3DF] text-white flex items-center justify-center font-normal text-[18px] shadow-sm shrink-0">
              {avatarChar}
            </div>
            <div className="flex flex-col gap-[2px] justify-center">
              <span className="text-[16px] font-normal text-white leading-tight flex items-center gap-1">
                User: <span className="border-b border-white/70 pb-[1px] inline-block">{displayName}</span>
              </span>
              <span className="text-[14px] text-white opacity-95 leading-tight">ID: {uid}</span>
            </div>
          </div>

          {/* Top-right bell inside white circular button matching reference photo 2 */}
          <button 
            type="button"
            onClick={() => setShowNotice(true)} 
            className="w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-gray-50 text-gray-600 border-none cursor-pointer shrink-0 outline-none"
            aria-label="Notifications"
          >
            <span className="material-icons-outlined text-[22px] text-[#555555]">notifications</span>
          </button>
        </div>

        {/* 3 Stat Columns (Balance, Commission, Interest) spread across full width */}
        <div className="grid grid-cols-3 w-full text-center items-center mt-5 pb-1">
          {/* Balance */}
          <div className="flex flex-col items-center">
            <strong className="text-[16px] font-normal text-white leading-none">
              ₹ {Number(balance || 0).toFixed(2)}
            </strong>
            <span className="text-[15px] text-white opacity-95 mt-1.5">Balance</span>
            <Link 
              href="/wallet/deposit" 
              className="mt-2.5 bg-[#2D98EE] text-white text-[13px] font-normal rounded-[2px] hover:opacity-90 select-none text-decoration-none shadow-sm flex items-center justify-center h-[28px] w-[80px] border-none outline-none"
            >
              Recharge
            </Link>
          </div>

          {/* Commission */}
          <div className="flex flex-col items-center">
            <strong className="text-[16px] font-normal text-white leading-none">
              ₹ 0
            </strong>
            <span className="text-[15px] text-white opacity-95 mt-1.5">Commission</span>
            <Link 
              href="/referral" 
              className="mt-2.5 bg-[#2D98EE] text-white text-[13px] font-normal rounded-[2px] hover:opacity-90 select-none text-decoration-none shadow-sm flex items-center justify-center h-[28px] w-[80px] border-none outline-none"
            >
              See
            </Link>
          </div>

          {/* Interest */}
          <div className="flex flex-col items-center">
            <strong className="text-[16px] font-normal text-white leading-none">
              ₹ 0
            </strong>
            <span className="text-[15px] text-white opacity-95 mt-1.5">Interest</span>
            <Link 
              href="/referral" 
              className="mt-2.5 bg-[#2D98EE] text-white text-[13px] font-normal rounded-[2px] hover:opacity-90 select-none text-decoration-none shadow-sm flex items-center justify-center h-[28px] w-[80px] border-none outline-none"
            >
              See
            </Link>
          </div>
        </div>
      </section>

      {/* Menu List - Full Viewport Width Flat White Continuous Surface */}
      <section className="bg-white w-full flex flex-col">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center h-[50px] pl-[16px] pr-[18px] hover:bg-gray-50 text-decoration-none group transition-colors w-full box-border border-b border-[#fafafa]"
          >
            <div className="w-[44px] flex items-center shrink-0">
              {item.customIcon ? (
                item.customIcon
              ) : (
                <span 
                  className="material-icons-outlined text-[22px] shrink-0"
                  style={{ color: item.isTealIcon ? "#00A091" : "#7b7b7b" }}
                >
                  {item.icon}
                </span>
              )}
            </div>
            <span className="text-[16px] font-normal text-[#555555] group-hover:text-black transition-colors flex-grow">
              {item.label}
            </span>
            {item.hasChevron && (
              <span className="material-icons-outlined text-[18px] text-[#999999] shrink-0 select-none">
                keyboard_arrow_down
              </span>
            )}
          </Link>
        ))}
      </section>

      {/* Logout Row - Full Viewport Width Light-Gray Container */}
      <section className="bg-[#f5f5f5] py-8 flex justify-center items-center w-full select-none">
        <button
          onClick={handleLogout}
          className="w-[54%] h-[40px] bg-white border border-[#e0e0e0] text-[#333333] text-[15px] font-normal rounded-[2px] flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors cursor-pointer outline-none"
        >
          Logout
        </button>
      </section>

      {/* Notice Modal Dialog matching reference photo */}
      {showNotice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] w-full max-w-[480px] p-6 shadow-lg flex flex-col justify-between min-h-[160px]">
            <div>
              <h3 className="text-[20px] font-normal text-[#222222] m-0 mb-4">Notice</h3>
              <p className="text-[14px] text-[#555555] m-0">no notice</p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowNotice(false)}
                className="bg-transparent border-none text-[#00A091] font-medium text-[14px] tracking-wide cursor-pointer outline-none hover:opacity-80"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
