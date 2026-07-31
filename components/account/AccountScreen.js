"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BottomNav from "@/components/home/BottomNav";
import { clearAuth, getToken } from "@/lib/auth";
import { getBalance } from "@/lib/walletApi";
import { getProfile } from "@/lib/userApi";
import { disconnectSocket } from "@/lib/socket";

export default function AccountScreen() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUserState] = useState(null);
  const [balance, setBalance] = useState(0);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

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
      <main className="min-h-screen bg-[#fafafa] max-w-[480px] mx-auto flex items-center justify-center">
        <div className="text-sm text-gray-400 font-normal">Loading...</div>
      </main>
    );
  }

  const displayName = user?.mobile || user?.name || "Player";
  const uid = user?.uid || user?.id?.slice(-8).toUpperCase() || "E348357";
  const avatarChar = displayName.charAt(0) || "P";

  const menuItems = [
    { label: "Sign In", href: "/account/vip", icon: "event_available" },
    { label: "Orders", href: "/games/history", icon: "assignment" },
    { label: "Promotion", href: "/referral", icon: "card_giftcard" },
    { label: "Red Envelope", href: "/account/gifts", icon: "mail" },
    { label: "Wallet", href: "/wallet", icon: "account_balance_wallet", isCollapsible: true },
    { label: "Bank Card", href: "/wallet/withdraw/accounts", icon: "credit_card" },
    { label: "Account Security", href: "/account/security", icon: "security" },
    { label: "App Download", href: "/account/guide", icon: "download" },
    { label: "Complaints & Suggestions", href: "/account/feedback", icon: "feedback" },
    { label: "About", href: "/about", icon: "info" },
  ];

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col max-w-[480px] mx-auto relative shadow-sm select-none text-[#222222]">
      {/* Profile Header Banner matching reference layout exactly */}
      <section className="bg-[#009688] text-white px-4 py-4 relative select-none shadow-sm">
        {/* User identification bar */}
        <div className="flex items-center gap-3">
          <div className="w-[40px] h-[40px] rounded-full bg-[#1E88E5] border border-white flex items-center justify-center font-normal text-white text-[18px] shadow-[0_3px_5px_-1px_rgba(0,0,0,0.2),0_6px_10px_0_rgba(0,0,0,0.14),0_1px_18px_0_rgba(0,0,0,0.12)] shrink-0">
            {avatarChar}
          </div>
          <div className="flex flex-col gap-0.5 justify-center">
            <span className="text-[14px] font-normal leading-tight">User: {displayName}</span>
            <span className="text-[12px] opacity-90 leading-tight">ID: {uid}</span>
          </div>
          
          {/* Top-right bell inside white circular button */}
          <Link 
            href="/account/notifications" 
            className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-gray-50 text-gray-500 text-decoration-none border-none outline-none"
            aria-label="Notifications"
          >
            <span className="material-icons-outlined text-[20px] text-gray-600">notifications</span>
          </Link>
        </div>


        {/* Stats Row */}
        <div className="grid grid-cols-3 text-center items-center pb-2">
          {/* Balance */}
          <div className="flex flex-col items-center">
            <strong className="text-[14px] font-normal leading-none">
              ₹{Number(balance || 0).toFixed(2)}
            </strong>
            <span className="text-[11px] opacity-90 mt-1.5">Balance</span>
            <Link 
              href="/wallet/deposit" 
              className="mt-2.5 px-3.5 py-0.5 bg-[#2196F3] text-white text-[12px] font-normal rounded-[2px] hover:opacity-90 select-none text-decoration-none shadow-sm flex items-center justify-center h-[24px] min-w-[70px] border-none outline-none"
            >
              Recharge
            </Link>
          </div>

          {/* Commission */}
          <div className="flex flex-col items-center">
            <strong className="text-[14px] font-normal leading-none">
              ₹0.00
            </strong>
            <span className="text-[11px] opacity-90 mt-1.5">Commission</span>
            <Link 
              href="/referral" 
              className="mt-2.5 px-3.5 py-0.5 bg-[#2196F3] text-white text-[12px] font-normal rounded-[2px] hover:opacity-90 select-none text-decoration-none shadow-sm flex items-center justify-center h-[24px] min-w-[70px] border-none outline-none"
            >
              See
            </Link>
          </div>

          {/* Interest */}
          <div className="flex flex-col items-center">
            <strong className="text-[14px] font-normal leading-none">
              ₹0.00
            </strong>
            <span className="text-[11px] opacity-90 mt-1.5">Interest</span>
            <Link 
              href="/referral" 
              className="mt-2.5 px-3.5 py-0.5 bg-[#2196F3] text-white text-[12px] font-normal rounded-[2px] hover:opacity-90 select-none text-decoration-none shadow-sm flex items-center justify-center h-[24px] min-w-[70px] border-none outline-none"
            >
              See
            </Link>
          </div>
        </div>
      </section>

      {/* Menu List */}
      <section className="bg-white mt-2 flex flex-col">
        {menuItems.map((item) => {
          if (item.isCollapsible) {
            return (
              <div key={item.label} className="flex flex-col">
                <button
                  onClick={() => setIsWalletOpen(!isWalletOpen)}
                  className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50 border-none outline-none bg-white text-left cursor-pointer transition-colors w-full"
                >
                  <span className="material-icons-outlined text-[20px] text-gray-500 shrink-0">
                    {item.icon}
                  </span>
                  <span className="text-[14px] font-normal text-gray-700 flex-grow">
                    {item.label}
                  </span>
                  <span 
                    className="material-icons-outlined text-[18px] text-gray-400 shrink-0 transition-transform duration-200"
                    style={{ transform: isWalletOpen ? 'rotate(180deg)' : 'none' }}
                  >
                    keyboard_arrow_down
                  </span>
                </button>
                
                {/* Wallet Dropdown Sub-links */}
                {isWalletOpen && (
                  <div className="bg-[#fafafa] flex flex-col pl-12 transition-all duration-300">
                    <Link
                      href="/wallet/deposit"
                      className="flex items-center justify-between py-3 pr-4 hover:bg-gray-100 text-decoration-none transition-colors"
                    >
                      <span className="text-[13px] text-gray-600">Recharge</span>
                      <span className="material-icons-outlined text-[16px] text-gray-400">chevron_right</span>
                    </Link>
                    <Link
                      href="/wallet/withdraw"
                      className="flex items-center justify-between py-3 pr-4 hover:bg-gray-100 text-decoration-none transition-colors"
                    >
                      <span className="text-[13px] text-gray-600">Withdraw</span>
                      <span className="material-icons-outlined text-[16px] text-gray-400">chevron_right</span>
                    </Link>
                    <Link
                      href="/wallet/transactions"
                      className="flex items-center justify-between py-3 pr-4 hover:bg-gray-100 text-decoration-none transition-colors"
                    >
                      <span className="text-[13px] text-gray-600">Transaction</span>
                      <span className="material-icons-outlined text-[16px] text-gray-400">chevron_right</span>
                    </Link>
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50 text-decoration-none group transition-colors"
            >
              <span className="material-icons-outlined text-[20px] text-gray-500 group-hover:text-[#009688] transition-colors shrink-0">
                {item.icon}
              </span>
              <span className="text-[14px] font-normal text-gray-700 group-hover:text-gray-900 transition-colors flex-grow">
                {item.label}
              </span>
              <span className="material-icons-outlined text-[18px] text-gray-400 group-hover:text-[#009688] transition-colors shrink-0 select-none">
                keyboard_arrow_down
              </span>
            </Link>
          );
        })}
      </section>

      {/* Logout Row */}
      <section className="bg-[#fafafa] py-6 flex justify-center select-none">
        <button
          onClick={handleLogout}
          className="w-1/2 h-[36px] bg-[#f5f5f5] text-[14px] text-gray-700 font-normal rounded-sm flex items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-200 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.1)] border-none outline-none"
        >
          <span className="material-icons-outlined text-[16px]">logout</span>
          <span>Logout</span>
        </button>
      </section>

      {/* Online service headset widget matching reference screenshot */}
      <Link
        href="/support"
        className="fixed right-4 bottom-20 bg-white rounded-full border border-emerald-500/10 shadow-md p-1.5 flex flex-col items-center justify-center select-none z-50 text-decoration-none hover:bg-gray-50 transition-colors"
        style={{ width: "56px", height: "56px" }}
      >
        <div className="text-emerald-600 bg-emerald-50 rounded-full p-1 flex items-center justify-center shrink-0">
          <span className="material-icons-outlined text-[20px] text-[#009688]">headset_mic</span>
        </div>
        <span className="text-[9px] font-medium text-[#009688] tracking-tight mt-0.5 leading-none">Online</span>
      </Link>

      <BottomNav />
    </main>
  );
}
