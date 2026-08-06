"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/home/BottomNav";
import { getBalance, requestWithdraw } from "@/lib/walletApi";
import { fetchWithdrawAccountsState } from "@/lib/withdrawAccounts";
import { parseWalletBalance } from "@/lib/walletBalance";
import { getToken } from "@/lib/auth";
import PageLoader from "@/components/brand/PageLoader";
import LoadingDialog from "@/components/auth/LoadingDialog";

export default function WithdrawalPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [banks, setBanks] = useState([]);
  const [bankAccountId, setBankAccountId] = useState("");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const balRes = await getBalance();
      const { available } = parseWalletBalance(balRes);
      setBalance(available);

      const state = await fetchWithdrawAccountsState();
      const accounts = state?.bank || [];
      setBanks(accounts);
      if (accounts.length > 0) {
        setBankAccountId(accounts[0].id);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [router, loadData]);

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    setError("");
    if (!amount || Number(amount) <= 0) {
      setError("Enter valid withdrawal amount");
      return;
    }
    if (!bankAccountId) {
      setError("Please add a bank account first");
      return;
    }
    if (!password) {
      setError("Please enter password");
      return;
    }

    setSubmitLoading(true);
    try {
      const selectedBank = banks.find((b) => b.id === bankAccountId);
      if (!selectedBank) {
        setError("Selected bank account not found");
        return;
      }

      const payload = {
        amount: Number(amount),
        method: "bank",
        accountDetails: {
          accountName: selectedBank.accountName,
          accountNumber: selectedBank.accountNumber,
          ifsc: selectedBank.ifsc,
          bankName: selectedBank.bankName,
        },
      };

      await requestWithdraw(payload);
      setTimeout(() => {
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          router.push("/withdrawalrecord");
        }, 1500);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to submit withdrawal.");
    } finally {
      setSubmitLoading(false);
    }
  };


  const selectedBank = banks.find((b) => b.id === bankAccountId);
  const inputVal = Number(amount) || 0;
  const withdrawalFee = Math.round(inputVal * 0.05);
  const toAccountAmount = inputVal > 0 ? (inputVal - Math.round(inputVal * 0.02)).toFixed(0) : "0";

  return (
    <main className="min-h-screen bg-white pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#333333]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[48px] px-4 flex items-center justify-between sticky top-0 z-10 shadow-none w-full">
        <div className="flex items-center gap-3">
          <Link href="/account" className="text-white text-decoration-none flex items-center">
            <span className="material-icons-outlined text-[22px]">arrow_back</span>
          </Link>
          <span className="text-[18px] font-normal text-white ml-1">Withdrawal</span>
        </div>
        <Link href="/withdrawalrecord" className="text-white bg-transparent border-none outline-none flex items-center p-0 cursor-pointer text-decoration-none">
          <span className="material-icons-outlined text-[22px]">menu</span>
        </Link>
      </nav>

      <div className="px-4 md:px-12 lg:px-20 py-4 flex flex-col w-full max-w-full mx-auto bg-white min-h-screen">
        {/* Balance Display */}
        <div className="text-center my-6 text-[20px] font-medium text-[#000000]">
          Balance: ₹ {balance.toFixed(2)}
        </div>

        {/* Input & Fee */}
        <div className="mt-1 w-full">
          <div className="flex items-center bg-white rounded-[4px] px-3.5 border border-[#dcdee0] shadow-sm h-[46px] w-full">
            {/* Circular card icon matching the reference */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3 shrink-0">
              <circle cx="10" cy="10" r="10" fill="#8f9094"/>
              <rect x="4.5" y="6" width="11" height="8" rx="1" fill="white"/>
              <rect x="4.5" y="7.5" width="11" height="2" fill="#8f9094"/>
            </svg>
            <input
              type="number"
              placeholder="Enter withdrawal amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-[14px] outline-none font-normal text-[#323233] bg-transparent border-none placeholder-[#969799] w-full"
            />
          </div>
          <div className="text-[14px] text-[#323233] font-normal mt-3 mb-6 ml-1">Fee: {withdrawalFee}, to account {toAccountAmount}</div>
        </div>

        {/* Payout Section */}
        <div className="flex flex-col mt-1 w-full">
          <span className="text-[14px] text-[#757575] font-normal mb-3 ml-1">Payout</span>
          
          <div className="flex items-center py-1">
            <span className="material-icons-outlined text-[#323233] text-[18px] mr-7">check</span>
            <span className="text-[14px] text-[#323233] font-normal">Bankcard</span>
          </div>
        </div>

        {/* Details Form */}
        <div className="flex flex-col mt-4 w-full">
          <Link href="/addbankcard" className="flex items-center justify-between py-3.5 text-decoration-none border-b border-[#f2f3f5] w-full">
            <div className="flex items-center">
              {/* Icon 2: Grey outline card with chip in bottom right */}
              <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3 shrink-0">
                <rect x="1" y="1" width="18" height="13" rx="1.5" stroke="#757575" strokeWidth="1.6"/>
                <line x1="1" y1="4.5" x2="19" y2="4.5" stroke="#757575" strokeWidth="1.6"/>
                <rect x="12" y="8" width="4" height="3" fill="#757575" rx="0.5"/>
              </svg>
              <span className="text-[14px] text-[#4e4e4e] font-normal">{selectedBank ? `${selectedBank.bankName} - ${selectedBank.accountNumber.slice(-4)}` : "Select Bank Card"}</span>
            </div>
            {/* Down Arrow icon v matching Apex King */}
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="#969799" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          
          <div className="flex items-center py-3.5 border-b border-[#f2f3f5] w-full">
            {/* Icon 3: Grey key outline with circular head and teeth */}
            <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3 shrink-0">
              <circle cx="5.5" cy="7.5" r="4" stroke="#757575" strokeWidth="1.6" fill="none"/>
              <line x1="9.5" y1="7.5" x2="18.5" y2="7.5" stroke="#757575" strokeWidth="1.6"/>
              <line x1="14.5" y1="7.5" x2="14.5" y2="11.5" stroke="#757575" strokeWidth="1.6"/>
              <line x1="17" y1="7.5" x2="17" y2="11.5" stroke="#757575" strokeWidth="1.6"/>
            </svg>
            <input
              type="password"
              placeholder="Enter your login password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 text-[14px] outline-none font-normal text-[#323233] bg-transparent border-none placeholder-[#969799] w-full"
            />
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="text-[13px] text-[#e53935] text-center font-normal mt-4 px-4 py-2 bg-[#ffebee] border border-[#ffcdd2] rounded-[4px] w-full break-words">
            {error}
          </div>
        )}

        {/* Withdrawal Button */}
        <div className="flex justify-center mt-8 w-full">
          <button
            type="button"
            onClick={handleWithdrawal}
            disabled={submitLoading}
            className="w-full py-3.5 bg-[#009688] text-white rounded-[4px] text-[14px] font-normal border-none cursor-pointer hover:bg-[#00897b] transition-colors shadow-none outline-none disabled:opacity-50"
          >
            Withdrawal
          </button>
        </div>
      </div>

      <BottomNav />
      <LoadingDialog visible={submitLoading} />
      {loading && <PageLoader />}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-[#4c4c4c]/95 text-white text-[13.5px] font-normal py-2 px-5 rounded-[8px] shadow-md shadow-black/10 pointer-events-none select-none text-center min-w-[110px]">
          success
        </div>
      )}
    </main>
  );
}
