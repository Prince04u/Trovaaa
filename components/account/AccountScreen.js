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

  // Accordion state
  const [walletOpen, setWalletOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Modals state
  const [showNotice, setShowNotice] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [signedInToday, setSignedInToday] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      if (res?.success) {
        setUserState(res.data);
        setNicknameInput(res.data.name || res.data.mobile || "");
      }
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

  const handleSaveNickname = () => {
    if (user && nicknameInput.trim()) {
      setUserState({ ...user, mobile: nicknameInput.trim(), name: nicknameInput.trim() });
    }
    setShowNameModal(false);
  };

  const handleSignIn = () => {
    setSignedInToday(true);
    setShowSignInModal(false);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#fafafa] w-full flex items-center justify-center">
        <div className="text-sm text-gray-400 font-normal">Loading...</div>
      </main>
    );
  }

  const displayName = user?.name || user?.mobile || "";
  const uid = user?.uid || user?.id?.slice(-8).toUpperCase() || "";
  const avatarChar = displayName ? displayName.charAt(0).toUpperCase() : "P";

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Profile Header Banner matching reference site bruzoo.games */}
      <section className="bg-[#009F8F] text-white px-[21px] pt-[14px] pb-[16px] min-h-[175px] flex flex-col justify-between relative select-none w-full box-border shadow-sm">
        {/* User identification top bar */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-[18px]">
            <div className="w-[44px] h-[44px] rounded-full bg-[#9DE3DF] text-white flex items-center justify-center font-normal text-[19px] shadow-sm shrink-0">
              {avatarChar}
            </div>
            <div className="flex flex-col gap-[2px] justify-center">
              <span className="text-[16px] font-normal text-white leading-tight flex items-center gap-1">
                User：
                <button
                  type="button"
                  onClick={() => setShowNameModal(true)}
                  className="bg-transparent border-none p-0 m-0 text-white border-b border-white/80 leading-tight cursor-pointer font-normal text-[16px] outline-none"
                >
                  {displayName}
                </button>
              </span>
              <span className="text-[14px] text-white opacity-95 leading-tight">ID：{uid}</span>
            </div>
          </div>

          {/* Top-right notice bell button */}
          <button 
            type="button"
            onClick={() => setShowNotice(true)} 
            className="w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-gray-50 border-none cursor-pointer shrink-0 outline-none p-0"
            aria-label="Notifications"
          >
            <img src={REF_ICONS.notice} alt="Notice" className="w-[24px] h-[24px] object-contain" />
          </button>
        </div>

        {/* 3 Stat Columns (Balance, Commission, Interest) */}
        <div className="grid grid-cols-3 w-full text-center items-center mt-5 pb-1">
          {/* Balance */}
          <div className="flex flex-col items-center">
            <strong className="text-[16px] font-normal text-white leading-none">
              ₹ {Number(balance || 0).toFixed(2)}
            </strong>
            <span className="text-[15px] text-white opacity-95 mt-1.5">Balance</span>
            <Link 
              href="/recharge" 
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
              href="/reward" 
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
              href="/interest" 
              className="mt-2.5 bg-[#2D98EE] text-white text-[13px] font-normal rounded-[2px] hover:opacity-90 select-none text-decoration-none shadow-sm flex items-center justify-center h-[28px] w-[80px] border-none outline-none"
            >
              See
            </Link>
          </div>
        </div>
      </section>

      {/* Menu List - Continuous Flat Surface matching Vue vant-collapse in bruzoo.games */}
      <section className="bg-white w-full flex flex-col">
        {/* Sign In */}
        <button
          type="button"
          onClick={() => setShowSignInModal(true)}
          className="flex items-center h-[50px] pl-[16px] pr-[18px] hover:bg-gray-50 text-left bg-transparent w-full box-border border-b border-[#fafafa] cursor-pointer outline-none"
        >
          <div className="w-[44px] flex items-center shrink-0">
            <img src={REF_ICONS.signIn} alt="Sign In" className="w-[24px] h-[24px] object-contain shrink-0" />
          </div>
          <span className="text-[16px] font-normal text-[#555555] flex-grow">Sign In</span>
          <span className="material-icons-outlined text-[18px] text-[#999999] shrink-0">keyboard_arrow_down</span>
        </button>

        {/* Orders */}
        <Link
          href="/orders"
          className="flex items-center h-[50px] pl-[16px] pr-[18px] hover:bg-gray-50 text-decoration-none w-full box-border border-b border-[#fafafa]"
        >
          <div className="w-[44px] flex items-center shrink-0">
            <img src={REF_ICONS.orders} alt="Orders" className="w-[24px] h-[24px] object-contain shrink-0" />
          </div>
          <span className="text-[16px] font-normal text-[#555555] flex-grow">Orders</span>
          <span className="material-icons-outlined text-[18px] text-[#999999] shrink-0">keyboard_arrow_down</span>
        </Link>

        {/* Promotion */}
        <Link
          href="/promotion"
          className="flex items-center h-[50px] pl-[16px] pr-[18px] hover:bg-gray-50 text-decoration-none w-full box-border border-b border-[#fafafa]"
        >
          <div className="w-[44px] flex items-center shrink-0">
            <img src={REF_ICONS.promotion} alt="Promotion" className="w-[24px] h-[24px] object-contain shrink-0" />
          </div>
          <span className="text-[16px] font-normal text-[#555555] flex-grow">Promotion</span>
          <span className="material-icons-outlined text-[18px] text-[#999999] shrink-0">keyboard_arrow_down</span>
        </Link>

        {/* Red Envelope */}
        <Link
          href="/redenvelope"
          className="flex items-center h-[50px] pl-[16px] pr-[18px] hover:bg-gray-50 text-decoration-none w-full box-border border-b border-[#fafafa]"
        >
          <div className="w-[44px] flex items-center shrink-0">
            <img src={REF_ICONS.redEnvelope} alt="Red Envelope" className="w-[24px] h-[24px] object-contain shrink-0" />
          </div>
          <span className="text-[16px] font-normal text-[#555555] flex-grow">Red Envelope</span>
          <span className="material-icons-outlined text-[18px] text-[#999999] shrink-0">keyboard_arrow_down</span>
        </Link>

        {/* Luck Draw */}
        <Link
          href="/luckDraw"
          className="flex items-center h-[50px] pl-[16px] pr-[18px] hover:bg-gray-50 text-decoration-none w-full box-border border-b border-[#fafafa]"
        >
          <div className="w-[44px] flex items-center shrink-0">
            <img src={REF_ICONS.luckDraw} alt="Luck Draw" className="w-[24px] h-[24px] object-contain shrink-0" />
          </div>
          <span className="text-[16px] font-normal text-[#555555] flex-grow">Luck Draw</span>
          <span className="material-icons-outlined text-[18px] text-[#999999] shrink-0">keyboard_arrow_down</span>
        </Link>

        {/* Wallet (Accordion) */}
        <div className="flex flex-col border-b border-[#fafafa]">
          <button
            type="button"
            onClick={() => setWalletOpen(!walletOpen)}
            className="flex items-center h-[50px] pl-[16px] pr-[18px] hover:bg-gray-50 text-left bg-transparent w-full box-border cursor-pointer outline-none"
          >
            <div className="w-[44px] flex items-center shrink-0">
              <img src={REF_ICONS.wallet} alt="Wallet" className="w-[24px] h-[24px] object-contain shrink-0" />
            </div>
            <span className="text-[16px] font-normal text-[#555555] flex-grow">Wallet</span>
            <span className={`material-icons-outlined text-[18px] text-[#999999] shrink-0 transition-transform duration-200 ${walletOpen ? "rotate-180" : ""}`}>
              keyboard_arrow_down
            </span>
          </button>

          {walletOpen && (
            <div className="flex flex-col bg-[#fcfcfc] border-t border-[#f0f0f0]">
              <Link
                href="/recharge"
                className="h-[44px] pl-[60px] pr-[18px] flex items-center text-[15px] text-[#555555] hover:text-black hover:bg-gray-100 text-decoration-none border-b border-[#f5f5f5]"
              >
                Recharge
              </Link>
              <Link
                href="/withdrawal"
                className="h-[44px] pl-[60px] pr-[18px] flex items-center text-[15px] text-[#555555] hover:text-black hover:bg-gray-100 text-decoration-none border-b border-[#f5f5f5]"
              >
                Withdrawal
              </Link>
              <Link
                href="/transactions"
                className="h-[44px] pl-[60px] pr-[18px] flex items-center text-[15px] text-[#555555] hover:text-black hover:bg-gray-100 text-decoration-none"
              >
                Transactions
              </Link>
            </div>
          )}
        </div>

        {/* Bank Card */}
        <Link
          href="/bankcard"
          className="flex items-center h-[50px] pl-[16px] pr-[18px] hover:bg-gray-50 text-decoration-none w-full box-border border-b border-[#fafafa]"
        >
          <div className="w-[44px] flex items-center shrink-0">
            <img src={REF_ICONS.bankCard} alt="Bank Card" className="w-[24px] h-[24px] object-contain shrink-0" />
          </div>
          <span className="text-[16px] font-normal text-[#555555] flex-grow">Bank Card</span>
          <span className="material-icons-outlined text-[18px] text-[#999999] shrink-0">keyboard_arrow_down</span>
        </Link>

        {/* Address */}
        <Link
          href="/address"
          className="flex items-center h-[50px] pl-[16px] pr-[18px] hover:bg-gray-50 text-decoration-none w-full box-border border-b border-[#fafafa]"
        >
          <div className="w-[44px] flex items-center shrink-0">
            <img src={REF_ICONS.address} alt="Address" className="w-[24px] h-[24px] object-contain shrink-0" />
          </div>
          <span className="text-[16px] font-normal text-[#555555] flex-grow">Address</span>
          <span className="material-icons-outlined text-[18px] text-[#999999] shrink-0">keyboard_arrow_down</span>
        </Link>

        {/* Account Security (Accordion) */}
        <div className="flex flex-col border-b border-[#fafafa]">
          <button
            type="button"
            onClick={() => setSecurityOpen(!securityOpen)}
            className="flex items-center h-[50px] pl-[16px] pr-[18px] hover:bg-gray-50 text-left bg-transparent w-full box-border cursor-pointer outline-none"
          >
            <div className="w-[44px] flex items-center shrink-0">
              <img src={REF_ICONS.accountSecurity} alt="Account Security" className="w-[24px] h-[24px] object-contain shrink-0" />
            </div>
            <span className="text-[16px] font-normal text-[#555555] flex-grow">Account Security</span>
            <span className={`material-icons-outlined text-[18px] text-[#999999] shrink-0 transition-transform duration-200 ${securityOpen ? "rotate-180" : ""}`}>
              keyboard_arrow_down
            </span>
          </button>

          {securityOpen && (
            <div className="flex flex-col bg-[#fcfcfc] border-t border-[#f0f0f0]">
              <Link
                href="/forgotpass"
                className="h-[44px] pl-[60px] pr-[18px] flex items-center text-[15px] text-[#555555] hover:text-black hover:bg-gray-100 text-decoration-none"
              >
                Reset Password
              </Link>
            </div>
          )}
        </div>

        {/* App Download (Accordion) */}
        <div className="flex flex-col border-b border-[#fafafa]">
          <button
            type="button"
            onClick={() => setDownloadOpen(!downloadOpen)}
            className="flex items-center h-[50px] pl-[16px] pr-[18px] hover:bg-gray-50 text-left bg-transparent w-full box-border cursor-pointer outline-none"
          >
            <div className="w-[44px] flex items-center shrink-0">
              <img src={REF_ICONS.appDownload} alt="App Download" className="w-[24px] h-[24px] object-contain shrink-0" />
            </div>
            <span className="text-[16px] font-normal text-[#555555] flex-grow">App Download</span>
            <span className={`material-icons-outlined text-[18px] text-[#999999] shrink-0 transition-transform duration-200 ${downloadOpen ? "rotate-180" : ""}`}>
              keyboard_arrow_down
            </span>
          </button>

          {downloadOpen && (
            <div className="flex flex-col bg-[#fcfcfc] border-t border-[#f0f0f0]">
              <a
                href="/bruzoo_1.0.0.apk"
                download="app.apk"
                className="h-[44px] pl-[60px] pr-[18px] flex items-center text-[15px] text-[#4e4e4e] hover:text-black hover:bg-gray-100 text-decoration-none"
              >
                Android Download
              </a>
            </div>
          )}
        </div>

        {/* Complaints & Suggestions */}
        <Link
          href="/complaints"
          className="flex items-center h-[50px] pl-[16px] pr-[18px] hover:bg-gray-50 text-decoration-none w-full box-border border-b border-[#fafafa]"
        >
          <div className="w-[44px] flex items-center shrink-0">
            <img src={REF_ICONS.complaints} alt="Complaints & Suggestions" className="w-[24px] h-[24px] object-contain shrink-0" />
          </div>
          <span className="text-[16px] font-normal text-[#555555] flex-grow">Complaints & Suggestions</span>
          <span className="material-icons-outlined text-[18px] text-[#999999] shrink-0">keyboard_arrow_down</span>
        </Link>

        {/* About (Accordion) */}
        <div className="flex flex-col border-b border-[#fafafa]">
          <button
            type="button"
            onClick={() => setAboutOpen(!aboutOpen)}
            className="flex items-center h-[50px] pl-[16px] pr-[18px] hover:bg-gray-50 text-left bg-transparent w-full box-border cursor-pointer outline-none"
          >
            <div className="w-[44px] flex items-center shrink-0">
              <img src={REF_ICONS.about} alt="About" className="w-[24px] h-[24px] object-contain shrink-0" />
            </div>
            <span className="text-[16px] font-normal text-[#555555] flex-grow">About</span>
            <span className={`material-icons-outlined text-[18px] text-[#999999] shrink-0 transition-transform duration-200 ${aboutOpen ? "rotate-180" : ""}`}>
              keyboard_arrow_down
            </span>
          </button>

          {aboutOpen && (
            <div className="flex flex-col bg-[#fcfcfc] border-t border-[#f0f0f0]">
              <Link
                href="/privacypolicy"
                className="h-[44px] pl-[60px] pr-[18px] flex items-center text-[15px] text-[#555555] hover:text-black hover:bg-gray-100 text-decoration-none border-b border-[#f5f5f5]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/riskagreement"
                className="h-[44px] pl-[60px] pr-[18px] flex items-center text-[15px] text-[#555555] hover:text-black hover:bg-gray-100 text-decoration-none"
              >
                Risk Disclosure Agreement
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Logout Row - Light Gray Container */}
      <section className="bg-[#f5f5f5] py-8 flex justify-center items-center w-full select-none">
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-[54%] h-[40px] bg-white border border-[#e0e0e0] text-[#333333] text-[15px] font-normal rounded-[2px] flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors cursor-pointer outline-none"
        >
          Logout
        </button>
      </section>

      {/* Notice Modal Dialog */}
      {showNotice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] w-full max-w-[480px] p-6 shadow-lg flex flex-col justify-between min-h-[160px]">
            <div>
              <h3 className="text-[20px] font-normal text-[#222222] m-0 mb-4">Notice</h3>
              <p className="text-[14px] text-[#555555] m-0">No New Notice</p>
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

      {/* Change Nick Name Modal Dialog */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] w-full max-w-[480px] p-6 shadow-lg flex flex-col justify-between">
            <h3 className="text-[18px] font-medium text-[#222222] m-0 mb-4">Change Nick Name</h3>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[14px] text-[#555555] shrink-0">Nick Name</span>
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                className="flex-grow border-b border-[#009688] outline-none text-[15px] py-1 text-[#333333]"
              />
            </div>
            <div className="flex justify-end gap-6">
              <button
                type="button"
                onClick={() => setShowNameModal(false)}
                className="bg-transparent border-none text-[#616161] font-medium text-[14px] cursor-pointer outline-none"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSaveNickname}
                className="bg-transparent border-none text-[#009688] font-medium text-[14px] cursor-pointer outline-none"
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign In Modal Dialog */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] w-full max-w-[480px] p-6 shadow-lg flex flex-col justify-between">
            <h3 className="text-[18px] font-medium text-[#222222] m-0 mb-4">Sign In</h3>
            <div className="flex flex-col gap-2 text-[14px] text-[#555555] mb-6">
              <p className="m-0">Total：{signedInToday ? 1 : 0} Days</p>
              <p className="m-0">Today Rebates：₹ 0</p>
              <p className="m-0">Total Rebates：₹ 0</p>
              <p className="m-0">Status：{signedInToday ? "Had signed in" : "No sign in"}</p>
            </div>
            <div className="flex justify-end gap-6">
              <button
                type="button"
                onClick={() => setShowSignInModal(false)}
                className="bg-transparent border-none text-[#888888] font-medium text-[14px] cursor-pointer outline-none"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSignIn}
                className="bg-transparent border-none text-[#009688] font-medium text-[14px] cursor-pointer outline-none"
              >
                SIGN IN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirm Modal Dialog */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] w-full max-w-[480px] p-6 shadow-lg flex flex-col justify-between">
            <h3 className="text-[18px] font-medium text-[#222222] m-0 mb-3">Confirm</h3>
            <p className="text-[14px] text-[#555555] m-0 mb-6">Do you want to logout?</p>
            <div className="flex justify-end gap-6">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="bg-transparent border-none text-[#888888] font-medium text-[14px] cursor-pointer outline-none"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-transparent border-none text-[#009688] font-medium text-[14px] cursor-pointer outline-none"
              >
                YES
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
