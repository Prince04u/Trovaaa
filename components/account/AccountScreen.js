"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BottomNav from "@/components/home/BottomNav";
import { clearAuth, getToken } from "@/lib/auth";
import { getBalance } from "@/lib/walletApi";
import { getProfile } from "@/lib/userApi";
import { disconnectSocket } from "@/lib/socket";

import { REF_ICONS } from "./ReferenceIcons";

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
    { label: "Sign In", href: "/account/vip", iconSrc: REF_ICONS.signIn, hasChevron: true },
    { label: "Orders", href: "/games/history", iconSrc: REF_ICONS.orders, hasChevron: true },
    { label: "Promotion", href: "/referral", iconSrc: REF_ICONS.promotion, hasChevron: true },
    { label: "Red Envelope", href: "/account/gifts", iconSrc: REF_ICONS.redEnvelope, hasChevron: false },
    { label: "Luck Draw", href: "/promo", iconSrc: REF_ICONS.luckDraw, hasChevron: true },
    { label: "Wallet", href: "/wallet", iconSrc: REF_ICONS.wallet, hasChevron: true },
    { label: "Bank Card", href: "/wallet/withdraw/accounts", iconSrc: REF_ICONS.bankCard, hasChevron: true },
    { label: "Address", href: "/account/profile", iconSrc: REF_ICONS.address, hasChevron: true },
    { label: "Account Security", href: "/account/security", iconSrc: REF_ICONS.accountSecurity, hasChevron: true },
    { label: "App Download", href: "/account/guide", iconSrc: REF_ICONS.appDownload, hasChevron: true },
    { label: "Complaints & Suggestions", href: "/account/feedback", iconSrc: REF_ICONS.complaints, hasChevron: true },
    { label: "About", href: "/about", iconSrc: REF_ICONS.about, hasChevron: true },
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
            className="w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-gray-50 border-none cursor-pointer shrink-0 outline-none p-0"
            aria-label="Notifications"
          >
            <img src={REF_ICONS.notice} alt="Notice" className="w-[24px] h-[24px] object-contain" />
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
              <img 
                src={item.iconSrc} 
                alt={item.label} 
                className="w-[24px] h-[24px] object-contain shrink-0" 
              />
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
