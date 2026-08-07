"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BottomNav from "@/components/home/BottomNav";
import { clearAuth, getToken, getUser } from "@/lib/auth";
import { getBalance } from "@/lib/walletApi";
import { getProfile } from "@/lib/userApi";
import { disconnectSocket } from "@/lib/socket";
import { REF_ICONS } from "./ReferenceIcons";
import LoadingDialog from "@/components/auth/LoadingDialog";

export default function AccountScreen() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUserState] = useState(() => {
    if (typeof window !== "undefined") {
      return getUser();
    }
    return null;
  });
  const [balance, setBalance] = useState(0);

  // Accordion state
  const [walletOpen, setWalletOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Modals state
  const [showNotice, setShowNotice] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [signedInToday, setSignedInToday] = useState(false);
  const [noticeText, setNoticeText] = useState("");


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

  const loadNotice = async () => {
    try {
      const res = await fetch("/api/platform/announcements");
      const resData = await res.json();
      if (resData?.success && resData?.data) {
        setNoticeText(resData.data);
      }
    } catch {}
  };

  useEffect(() => {
    const init = async () => {
      if (getToken()) {
        await Promise.all([loadProfile(), loadBalance(), loadNotice()]);
        setMounted(true);
      } else {
        router.replace("/login");
      }
    };
    init();
  }, [router]);

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



  let cleanMobile = (user?.mobile || user?.name || "").replace(/\s*\(Multiple\)/gi, "").trim();
  if (cleanMobile) {
    if (!cleanMobile.startsWith("+91")) {
      if (cleanMobile.startsWith("91") && cleanMobile.length === 12) {
        cleanMobile = "+" + cleanMobile;
      } else {
        cleanMobile = "+91" + cleanMobile;
      }
    }
  }
  const displayName = cleanMobile || "User";
  const uid = user?.uid || user?.id?.slice(-8).toUpperCase() || "";
  const avatarChar = displayName ? (displayName.startsWith("+91") ? displayName.charAt(3) : displayName.charAt(0)).toUpperCase() : "P";

  return (
    <main className="min-h-screen bg-[#fafafa] pb-[64px] flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Profile Header Banner matching reference site luvomall.games */}
      <section className="mine_info w-full bg-[#009688] pt-[12px] pb-[12px] box-border text-white">
        {/* User identification top bar */}
        <div className="flex items-center justify-between w-full h-[50px] px-[12px] box-border">
          <div className="flex items-center">
            <div className="w-[45px] h-[45px] rounded-full bg-[#9DE3DF] text-white flex items-center justify-center font-normal text-[20px] shrink-0 border border-white/20 mr-[15px]">
              {avatarChar}
            </div>
            <div className="flex flex-col text-[14px] leading-[22px]">
              <div className="flex items-center font-normal tracking-wide mb-[2px]">
                User:
                <span className="text-white ml-[4px]">
                  {displayName}
                </span>
              </div>
              <div className="font-normal tracking-wide">ID: {uid}</div>
            </div>
          </div>

          {/* Top-right notice bell button */}
          <button 
            type="button"
            onClick={() => setShowNotice(true)} 
            className="notice w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center border-none cursor-pointer shrink-0 outline-none p-0 mt-1"
            aria-label="Notifications"
          >
            <img src={REF_ICONS.notice} alt="Notice" className="w-[24px] h-[24px] object-contain" />
          </button>
        </div>

        {/* 3 Stat Columns (Balance, Commission, Interest) */}
        <div className="mine_top_items flex items-center justify-between w-full mt-[12px] px-[20px] py-[5px] box-border">
          {/* Balance */}
          <div className="top_item flex flex-col items-center w-[80px]">
            <div className="text-[14px] font-normal leading-tight whitespace-nowrap">₹ {Number(balance || 0).toFixed(2)}</div>
            <div className="text-[12px] font-normal tracking-wide opacity-90 leading-tight mt-[3px]">Balance</div>
            <Link 
              href="/recharge" 
              className="one_btn ripple bg-[#2196f3] text-white text-[12px] w-[80px] h-[20px] mt-[6px] flex items-center justify-center border-none outline-none shadow-none cursor-pointer rounded-[2px] text-decoration-none"
            >
              Recharge
            </Link>
          </div>

          {/* Commission */}
          <div className="top_item flex flex-col items-center w-[80px]">
            <div className="text-[14px] font-normal leading-tight whitespace-nowrap">₹ 0</div>
            <div className="text-[12px] font-normal tracking-wide opacity-90 leading-tight mt-[3px]">Commission</div>
            <Link 
              href="/reward" 
              className="one_btn ripple bg-[#2196f3] text-white text-[12px] w-[80px] h-[20px] mt-[6px] flex items-center justify-center border-none outline-none shadow-none cursor-pointer rounded-[2px] text-decoration-none"
            >
              See
            </Link>
          </div>

          {/* Interest */}
          <div className="top_item flex flex-col items-center w-[80px]">
            <div className="text-[14px] font-normal leading-tight whitespace-nowrap">₹ 0</div>
            <div className="text-[12px] font-normal tracking-wide opacity-90 leading-tight mt-[3px]">Interest</div>
            <Link 
              href="/interest" 
              className="one_btn ripple bg-[#2196f3] text-white text-[12px] w-[80px] h-[20px] mt-[6px] flex items-center justify-center border-none outline-none shadow-none cursor-pointer rounded-[2px] text-decoration-none"
            >
              See
            </Link>
          </div>
        </div>
      </section>

      {/* Menu List - Continuous Flat Surface matching Vue vant-collapse in luvomall.games */}
      <section className="bg-white w-full flex flex-col pl-[15px]">
        {/* Sign In */}
        <button
          type="button"
          onClick={() => setShowSignInModal(true)}
          className="flex items-center py-[15px] pr-[15px] hover:bg-gray-50 text-left bg-transparent w-full box-border cursor-pointer outline-none"
        >
          <img src={REF_ICONS.signIn} alt="Sign In" className="w-[24px] h-[24px] object-contain shrink-0 opacity-80 mr-[20px]" />
          <div className="flex-grow flex items-center justify-between">
            <span className="text-[15px] font-normal text-[#333333]">Sign In</span>
            <span className="material-icons-outlined text-[18px] text-[#c8c9cc] font-light">keyboard_arrow_down</span>
          </div>
        </button>

        {/* Orders */}
        <Link
          href="/orders"
          className="flex items-center py-[15px] pr-[15px] hover:bg-gray-50 text-decoration-none w-full box-border"
        >
          <img src={REF_ICONS.orders} alt="Orders" className="w-[24px] h-[24px] object-contain shrink-0 opacity-80 mr-[20px]" />
          <div className="flex-grow flex items-center justify-between">
            <span className="text-[15px] font-normal text-[#333333]">Orders</span>
            <span className="material-icons-outlined text-[18px] text-[#c8c9cc] font-light">keyboard_arrow_down</span>
          </div>
        </Link>

        {/* Promotion */}
        <Link
          href="/promotion"
          className="flex items-center py-[15px] pr-[15px] hover:bg-gray-50 text-decoration-none w-full box-border"
        >
          <img src={REF_ICONS.promotion} alt="Promotion" className="w-[24px] h-[24px] object-contain shrink-0 opacity-80 mr-[20px]" />
          <div className="flex-grow flex items-center justify-between">
            <span className="text-[15px] font-normal text-[#333333]">Promotion</span>
            <span className="material-icons-outlined text-[18px] text-[#c8c9cc] font-light">keyboard_arrow_down</span>
          </div>
        </Link>

        {/* Red Envelope */}
        <Link
          href="/redenvelope"
          className="flex items-center py-[15px] pr-[15px] hover:bg-gray-50 text-decoration-none w-full box-border"
        >
          <img src={REF_ICONS.redEnvelope} alt="Red Envelope" className="w-[24px] h-[24px] object-contain shrink-0 opacity-80 mr-[20px]" />
          <div className="flex-grow flex items-center justify-between">
            <span className="text-[15px] font-normal text-[#333333]">Red Envelope</span>
            <span className="material-icons-outlined text-[18px] text-[#c8c9cc] font-light">keyboard_arrow_down</span>
          </div>
        </Link>



        {/* Wallet (Accordion) */}
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setWalletOpen(!walletOpen)}
            className="flex items-center py-[15px] pr-[15px] hover:bg-gray-50 text-left bg-transparent w-full box-border cursor-pointer outline-none"
          >
            <img src={REF_ICONS.wallet} alt="Wallet" className="w-[24px] h-[24px] object-contain shrink-0 opacity-80 mr-[20px]" />
            <div className="flex-grow flex items-center justify-between">
              <span className="text-[15px] font-normal text-[#333333]">Wallet</span>
              <span className={`material-icons-outlined text-[18px] text-[#c8c9cc] font-light transition-transform duration-200 ${walletOpen ? "rotate-180" : ""}`}>
                keyboard_arrow_down
              </span>
            </div>
          </button>

          <div
            className="transition-all duration-300 ease-in-out overflow-hidden"
            style={{
              maxHeight: walletOpen ? "132px" : "0px",
              opacity: walletOpen ? 1 : 0,
            }}
          >
            <div className="flex flex-col bg-white border-t border-[#f5f5f5]">
              <Link
                href="/recharge"
                className="h-[44px] pl-[60px] pr-[18px] flex items-center text-[15px] text-[#555555] hover:text-black hover:bg-gray-100 text-decoration-none"
              >
                Recharge
              </Link>
              <Link
                href="/withdrawal"
                className="h-[44px] pl-[60px] pr-[18px] flex items-center text-[15px] text-[#555555] hover:text-black hover:bg-gray-100 text-decoration-none"
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
          </div>
        </div>

        {/* Bank Card */}
        <Link
          href="/bankcard"
          className="flex items-center py-[15px] pr-[15px] hover:bg-gray-50 text-decoration-none w-full box-border"
        >
          <img src={REF_ICONS.bankCard} alt="Bank Card" className="w-[24px] h-[24px] object-contain shrink-0 opacity-80 mr-[20px]" />
          <div className="flex-grow flex items-center justify-between">
            <span className="text-[15px] font-normal text-[#333333]">Bank Card</span>
            <span className="material-icons-outlined text-[18px] text-[#c8c9cc] font-light">keyboard_arrow_down</span>
          </div>
        </Link>

        {/* Address */}
        <Link
          href="/address"
          className="flex items-center py-[15px] pr-[15px] hover:bg-gray-50 text-decoration-none w-full box-border"
        >
          <img src={REF_ICONS.address} alt="Address" className="w-[24px] h-[24px] object-contain shrink-0 opacity-80 mr-[20px]" />
          <div className="flex-grow flex items-center justify-between">
            <span className="text-[15px] font-normal text-[#333333]">Address</span>
            <span className="material-icons-outlined text-[18px] text-[#c8c9cc] font-light">keyboard_arrow_down</span>
          </div>
        </Link>

        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setSecurityOpen(!securityOpen)}
            className="flex items-center py-[15px] pr-[15px] hover:bg-gray-50 text-left bg-transparent w-full box-border cursor-pointer outline-none"
          >
            <img src={REF_ICONS.accountSecurity} alt="Account Security" className="w-[24px] h-[24px] object-contain shrink-0 opacity-80 mr-[20px]" />
            <div className="flex-grow flex items-center justify-between">
              <span className="text-[15px] font-normal text-[#333333]">Account Security</span>
              <span className={`material-icons-outlined text-[18px] text-[#c8c9cc] font-light transition-transform duration-200 ${securityOpen ? "rotate-180" : ""}`}>
                keyboard_arrow_down
              </span>
            </div>
          </button>

          <div
            className="transition-all duration-300 ease-in-out overflow-hidden"
            style={{
              maxHeight: securityOpen ? "44px" : "0px",
              opacity: securityOpen ? 1 : 0,
            }}
          >
            <div className="flex flex-col bg-[#fcfcfc] border-t border-[#f0f0f0]">
              <Link
                href="/forgotpass"
                className="h-[44px] pl-[60px] pr-[18px] flex items-center text-[15px] text-[#555555] hover:text-black hover:bg-gray-100 text-decoration-none"
              >
                Reset Password
              </Link>
            </div>
          </div>
        </div>

        {/* App Download (Direct Link) */}
        <a
          href="/Luvomall.apk"
          download="Luvomall.apk"
          className="flex items-center py-[15px] pr-[15px] hover:bg-gray-50 text-decoration-none w-full box-border cursor-pointer"
        >
          <img src={REF_ICONS.appDownload} alt="App Download" className="w-[24px] h-[24px] object-contain shrink-0 opacity-80 mr-[20px]" />
          <div className="flex-grow flex items-center justify-between">
            <span className="text-[15px] font-normal text-[#333333]">App Download</span>
            <span className="material-icons-outlined text-[18px] text-[#c8c9cc] font-light">keyboard_arrow_down</span>
          </div>
        </a>

        {/* Complaints & Suggestions */}
        <Link
          href="/complaints"
          className="flex items-center py-[15px] pr-[15px] hover:bg-gray-50 text-decoration-none w-full box-border"
        >
          <img src={REF_ICONS.complaints} alt="Complaints & Suggestions" className="w-[24px] h-[24px] object-contain shrink-0 opacity-80 mr-[20px]" />
          <div className="flex-grow flex items-center justify-between">
            <span className="text-[15px] font-normal text-[#333333]">Complaints & Suggestions</span>
            <span className="material-icons-outlined text-[18px] text-[#c8c9cc] font-light">keyboard_arrow_down</span>
          </div>
        </Link>

        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setAboutOpen(!aboutOpen)}
            className="flex items-center py-[15px] pr-[15px] hover:bg-gray-50 text-left bg-transparent w-full box-border cursor-pointer outline-none"
          >
            <img src={REF_ICONS.about} alt="About" className="w-[24px] h-[24px] object-contain shrink-0 opacity-80 mr-[20px]" />
            <div className="flex-grow flex items-center justify-between">
              <span className="text-[15px] font-normal text-[#333333]">About</span>
              <span className={`material-icons-outlined text-[18px] text-[#c8c9cc] font-light transition-transform duration-200 ${aboutOpen ? "rotate-180" : ""}`}>
                keyboard_arrow_down
              </span>
            </div>
          </button>
          <div
            className="transition-all duration-300 ease-in-out overflow-hidden w-full"
            style={{
              maxHeight: aboutOpen ? "88px" : "0px",
              opacity: aboutOpen ? 1 : 0,
            }}
          >
            <div className="flex flex-col bg-[#fcfcfc] border-t border-[#f0f0f0] w-full">
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
          </div>
        </div>
      </section>

      {/* Logout Row - Exact Screenshot Styling */}
      <section className="bg-transparent py-[20px] flex justify-center items-center w-full select-none">
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-[240px] h-[44px] bg-white text-[#323233] text-[15px] font-normal cursor-pointer flex items-center justify-center outline-none shadow-sm transition-colors"
          style={{ border: "1px solid #ebedf0", borderRadius: "4px" }}
        >
          Logout
        </button>
      </section>

      {/* Floating Telegram Support Button */}
      <a
        href="https://t.me/luvomall66666"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-[15px] top-[40%] bg-white rounded-full w-[65px] h-[65px] border border-[#009688] shadow-[0px_2px_10px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center z-50 text-decoration-none"
      >
        <svg viewBox="0 0 24 24" className="w-[30px] h-[30px] mb-[2px]">
          <circle cx="12" cy="12" r="12" fill="#2AABEE" />
          <path
            d="M17.5 7.97l-2.27 10.7c-.17.75-.62.93-1.25.58l-3.46-2.55-1.67 1.6c-.18.18-.34.34-.7.34l.25-3.5 6.38-5.76c.28-.25-.06-.39-.43-.14l-7.88 4.96-3.4-1.06c-.74-.23-.75-.74.15-1.1l13.3-5.13c.6-.22 1.14.15.93 1.2z"
            fill="white"
          />
        </svg>
        <span className="text-[#009688] text-[11px] font-medium leading-none">Telegram</span>
      </a>

      {/* Notice Modal Dialog */}
      {showNotice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] w-full max-w-[480px] p-6 shadow-lg flex flex-col justify-between min-h-[160px]">
            <div>
              <h3 className="text-[20px] font-normal text-[#222222] m-0 mb-4">Notice</h3>
              <div className="text-[14px] text-[#555555] m-0 whitespace-pre-wrap leading-relaxed">
                {noticeText || "No New Notice"}
              </div>
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
          <div className="wrapper bg-white rounded-[4px] w-full max-w-[480px] p-[15px] shadow-lg flex flex-col justify-between">
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

      {!mounted && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "transparent" }}>
          <LoadingDialog visible={true} />
        </div>
      )}

      <BottomNav />
    </main>
  );
}
