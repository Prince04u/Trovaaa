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
import BankCardModal from "./BankCardModal";
import LoadingDialog from "@/components/auth/LoadingDialog";

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

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#fafafa] w-full flex items-center justify-center">
        <LoadingDialog visible={true} />
      </main>
    );
  }

  const displayName = user?.name || user?.mobile || "";
  const uid = user?.uid || user?.id?.slice(-8).toUpperCase() || "";
  const avatarChar = displayName ? displayName.charAt(0).toUpperCase() : "P";

  return (
    <main className="min-h-screen bg-[#fafafa] pb-[64px] flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Profile Header Banner matching reference site luvomall.games */}
      <section className="w-full bg-[#009688] pt-[20px] pb-[15px] px-[20px] box-border text-white">
        {/* User identification top bar */}
        <div className="flex items-center justify-between w-full h-[60px]">
          <div className="flex items-center">
            <div className="w-[45px] h-[45px] rounded-full bg-[#9DE3DF] text-white flex items-center justify-center font-normal text-[20px] shrink-0 border border-white/20 mr-[15px]">
              {avatarChar}
            </div>
            <div className="flex flex-col text-[14px] leading-[22px]">
              <div className="flex items-center font-normal tracking-wide mb-[2px]">
                User：
                <button
                  type="button"
                  onClick={() => setShowNameModal(true)}
                  className="bg-transparent border-none p-0 m-0 text-white cursor-pointer font-normal outline-none ml-[4px]"
                >
                  {displayName}
                </button>
              </div>
              <div className="font-normal tracking-wide">ID：{uid}</div>
            </div>
          </div>

          {/* Top-right notice bell button */}
          <button 
            type="button"
            onClick={() => setShowNotice(true)} 
            className="w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center border-none cursor-pointer shrink-0 outline-none p-0 shadow-sm mt-1"
            aria-label="Notifications"
          >
            <img src={REF_ICONS.notice} alt="Notice" className="w-[20px] h-[20px] object-contain opacity-80" />
          </button>
        </div>

        {/* 3 Stat Columns (Balance, Commission, Interest) */}
        <div className="flex items-center justify-around w-full mt-[10px] pb-[10px]">
          {/* Balance */}
          <div className="flex flex-col items-center">
            <div className="mb-[2px] font-normal text-[15px]">₹ {Number(balance || 0).toFixed(2)}</div>
            <span className="text-[14px] font-normal tracking-wide mb-[5px]">Balance</span>
            <Link 
              href="/recharge" 
              className="bg-[#2196f3] text-white text-[13px] px-[16px] py-[3px] rounded-none select-none text-decoration-none flex items-center justify-center border-none outline-none shadow-none"
            >
              Recharge
            </Link>
          </div>

          {/* Commission */}
          <div className="flex flex-col items-center">
            <div className="mb-[2px] font-normal text-[15px]">₹ 0</div>
            <span className="text-[14px] font-normal tracking-wide mb-[5px]">Commission</span>
            <Link 
              href="/reward" 
              className="bg-[#2196f3] text-white text-[13px] px-[22px] py-[3px] rounded-none select-none text-decoration-none flex items-center justify-center border-none outline-none shadow-none"
            >
              See
            </Link>
          </div>

          {/* Interest */}
          <div className="flex flex-col items-center">
            <div className="mb-[2px] font-normal text-[15px]">₹ 0</div>
            <span className="text-[14px] font-normal tracking-wide mb-[5px]">Interest</span>
            <Link 
              href="/interest" 
              className="bg-[#2196f3] text-white text-[13px] px-[22px] py-[3px] rounded-none select-none text-decoration-none flex items-center justify-center border-none outline-none shadow-none"
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
          <div className="flex justify-center items-center shrink-0 w-[24px] mr-[10px]">
            <img src={REF_ICONS.signIn} alt="Sign In" className="w-[22px] h-[22px] object-contain shrink-0 opacity-80" />
          </div>
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
          <div className="flex justify-center items-center shrink-0 w-[24px] mr-[10px]">
            <img src={REF_ICONS.orders} alt="Orders" className="w-[22px] h-[22px] object-contain shrink-0 opacity-80" />
          </div>
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
          <div className="flex justify-center items-center shrink-0 w-[24px] mr-[10px]">
            <img src={REF_ICONS.promotion} alt="Promotion" className="w-[22px] h-[22px] object-contain shrink-0 opacity-80" />
          </div>
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
          <div className="flex justify-center items-center shrink-0 w-[24px] mr-[10px]">
            <img src={REF_ICONS.redEnvelope} alt="Red Envelope" className="w-[22px] h-[22px] object-contain shrink-0 opacity-80" />
          </div>
          <div className="flex-grow flex items-center justify-between">
            <span className="text-[15px] font-normal text-[#333333]">Red Envelope</span>
            <span className="material-icons-outlined text-[18px] text-[#c8c9cc] font-light">keyboard_arrow_down</span>
          </div>
        </Link>

        {/* Luck Draw */}
        <Link
          href="/luckDraw"
          className="flex items-center py-[15px] pr-[15px] hover:bg-gray-50 text-decoration-none w-full box-border"
        >
          <div className="flex justify-center items-center shrink-0 w-[24px] mr-[10px]">
            <img src={REF_ICONS.luckDraw} alt="Luck Draw" className="w-[22px] h-[22px] object-contain shrink-0 opacity-80" />
          </div>
          <div className="flex-grow flex items-center justify-between">
            <span className="text-[15px] font-normal text-[#333333]">Luck Draw</span>
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
            <div className="flex justify-center items-center shrink-0 w-[24px] mr-[10px]">
              <img src={REF_ICONS.wallet} alt="Wallet" className="w-[22px] h-[22px] object-contain shrink-0 opacity-80" />
            </div>
            <div className="flex-grow flex items-center justify-between">
              <span className="text-[15px] font-normal text-[#333333]">Wallet</span>
              <span className={`material-icons-outlined text-[18px] text-[#c8c9cc] font-light transition-transform duration-200 ${walletOpen ? "rotate-180" : ""}`}>
                keyboard_arrow_down
              </span>
            </div>
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
          className="flex items-center py-[15px] pr-[15px] hover:bg-gray-50 text-decoration-none w-full box-border"
        >
          <div className="flex justify-center items-center shrink-0 w-[24px] mr-[10px]">
            <img src={REF_ICONS.bankCard} alt="Bank Card" className="w-[22px] h-[22px] object-contain shrink-0 opacity-80" />
          </div>
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
          <div className="flex justify-center items-center shrink-0 w-[24px] mr-[10px]">
            <img src={REF_ICONS.address} alt="Address" className="w-[22px] h-[22px] object-contain shrink-0 opacity-80" />
          </div>
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
            <div className="flex justify-center items-center shrink-0 w-[24px] mr-[10px]">
              <img src={REF_ICONS.accountSecurity} alt="Account Security" className="w-[22px] h-[22px] object-contain shrink-0 opacity-80" />
            </div>
            <div className="flex-grow flex items-center justify-between">
              <span className="text-[15px] font-normal text-[#333333]">Account Security</span>
              <span className={`material-icons-outlined text-[18px] text-[#c8c9cc] font-light transition-transform duration-200 ${securityOpen ? "rotate-180" : ""}`}>
                keyboard_arrow_down
              </span>
            </div>
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

        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setDownloadOpen(!downloadOpen)}
            className="flex items-center py-[15px] pr-[15px] hover:bg-gray-50 text-left bg-transparent w-full box-border cursor-pointer outline-none"
          >
            <div className="flex justify-center items-center shrink-0 w-[24px] mr-[10px]">
              <img src={REF_ICONS.appDownload} alt="App Download" className="w-[22px] h-[22px] object-contain shrink-0 opacity-80" />
            </div>
            <div className="flex-grow flex items-center justify-between">
              <span className="text-[15px] font-normal text-[#333333]">App Download</span>
              <span className={`material-icons-outlined text-[18px] text-[#c8c9cc] font-light transition-transform duration-200 ${downloadOpen ? "rotate-180" : ""}`}>
                keyboard_arrow_down
              </span>
            </div>
          </button>

          {downloadOpen && (
            <div className="flex flex-col bg-[#fcfcfc] border-t border-[#f0f0f0]">
              <a
                href="/luvomall_1.0.0.apk"
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
          className="flex items-center py-[15px] pr-[15px] hover:bg-gray-50 text-decoration-none w-full box-border"
        >
          <div className="flex justify-center items-center shrink-0 w-[24px] mr-[10px]">
            <img src={REF_ICONS.complaints} alt="Complaints & Suggestions" className="w-[22px] h-[22px] object-contain shrink-0 opacity-80" />
          </div>
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
            <div className="flex justify-center items-center shrink-0 w-[24px] mr-[10px]">
              <img src={REF_ICONS.about} alt="About" className="w-[22px] h-[22px] object-contain shrink-0 opacity-80" />
            </div>
            <div className="flex-grow flex items-center justify-between">
              <span className="text-[15px] font-normal text-[#333333]">About</span>
              <span className={`material-icons-outlined text-[18px] text-[#c8c9cc] font-light transition-transform duration-200 ${aboutOpen ? "rotate-180" : ""}`}>
                keyboard_arrow_down
              </span>
            </div>
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
      <section className="bg-transparent py-[20px] flex justify-center items-center w-full select-none">
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-[54%] h-[40px] bg-white border border-[#e0e0e0] text-[#333333] text-[15px] font-normal rounded-[2px] flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors cursor-pointer outline-none"
        >
          Logout
        </button>
      </section>

      {/* Floating Customer Service Button (Online) */}
      <Link href="/customer-service" className="fixed right-[10px] top-[40%] bg-white rounded-full w-[60px] h-[60px] shadow-[0px_2px_10px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center z-50 text-decoration-none">
        <span className="material-icons-outlined text-[#009688] text-[28px] mb-[2px]">support_agent</span>
        <span className="text-[#999] text-[12px] font-light">Online</span>
      </Link>

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
