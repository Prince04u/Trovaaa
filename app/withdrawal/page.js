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
    if (!amount || Number(amount) <= 0) {
      alert("Enter valid withdrawal amount");
      return;
    }
    if (!bankAccountId) {
      alert("Please add a bank account first");
      return;
    }
    if (!password) {
      alert("Please enter password");
      return;
    }

    setSubmitLoading(true);
    try {
      const selectedBank = banks.find((b) => b.id === bankAccountId);
      if (!selectedBank) {
        alert("Selected bank account not found");
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
      alert(`Withdrawal request for ₹${amount} submitted!`);
      router.push("/withdrawalrecord");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to submit withdrawal.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  const selectedBank = banks.find((b) => b.id === bankAccountId);
  const toAccountAmount = amount && !isNaN(Number(amount)) && Number(amount) > 0 ? Number(amount).toFixed(0) : "0";

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

      <div className="px-4 pt-4 flex flex-col w-full max-w-2xl mx-auto bg-white">
        {/* Balance Display */}
        <div className="text-center my-6 text-[20px] font-medium text-[#000000]">
          Balance: ₹ {balance.toFixed(2)}
        </div>

        {/* Input & Fee */}
        <div className="mt-1">
          <div className="flex items-center bg-white rounded-[4px] px-3.5 border border-[#dcdee0] shadow-sm h-[46px]">
            {/* Icon 1: Grey filled circle with white card */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3 shrink-0">
              <circle cx="11" cy="11" r="10" fill="#B5B5B5"/>
              <rect x="5.5" y="7" width="11" height="8" rx="1" fill="white"/>
              <rect x="5.5" y="8.5" width="11" height="2" fill="#B5B5B5"/>
            </svg>
            <input
              type="number"
              placeholder="Enter withdrawal amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-[14px] outline-none font-normal text-[#323233] bg-transparent border-none placeholder-[#969799] w-full"
            />
          </div>
          <div className="text-[14px] text-[#323233] font-normal mt-3 mb-6 ml-1">Fee: 0,to account {toAccountAmount}</div>
        </div>

        {/* Payout Section */}
        <div className="flex flex-col mt-1">
          <span className="text-[14px] text-[#757575] font-normal mb-3 ml-1">Payout</span>
          
          <div className="flex items-center py-1">
            <span className="material-icons-outlined text-[#323233] text-[18px] mr-7">check</span>
            <span className="text-[14px] text-[#323233] font-normal">Bankcard</span>
          </div>
        </div>

        {/* Details Form */}
        <div className="flex flex-col mt-4">
          <Link href="/addbankcard" className="flex items-center justify-between py-3.5 text-decoration-none border-b border-[#f2f3f5]">
            <div className="flex items-center">
              {/* Icon 2: Grey outline card with chip in bottom right */}
              <svg width="22" height="17" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3 shrink-0">
                <rect x="1" y="1" width="20" height="15" rx="2" stroke="#757575" strokeWidth="1.8"/>
                <line x1="1" y1="5.5" x2="21" y2="5.5" stroke="#757575" strokeWidth="1.8"/>
                <rect x="13.5" y="9.5" width="4.5" height="3" fill="#757575" rx="0.5"/>
              </svg>
              <span className="text-[14px] text-[#4e4e4e] font-normal">{selectedBank ? `${selectedBank.bankName} - ${selectedBank.accountNumber.slice(-4)}` : "Select Bank Card"}</span>
            </div>
            <span className="material-icons-outlined text-[#969799] text-[18px]">chevron_right</span>
          </Link>
          
          <div className="flex items-center py-3.5 border-b border-[#f2f3f5]">
            {/* Icon 3: Grey key outline with circular head and teeth */}
            <svg width="22" height="17" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3 shrink-0">
              <circle cx="6.5" cy="8.5" r="4.5" stroke="#757575" strokeWidth="1.8" fill="none"/>
              <line x1="11" y1="8.5" x2="20" y2="8.5" stroke="#757575" strokeWidth="1.8"/>
              <line x1="16" y1="8.5" x2="16" y2="12.5" stroke="#757575" strokeWidth="1.8"/>
              <line x1="18.5" y1="8.5" x2="18.5" y2="12.5" stroke="#757575" strokeWidth="1.8"/>
            </svg>
            <input
              type="password"
              placeholder="Enter your login password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 text-[14px] outline-none font-normal text-[#323233] bg-transparent border-none placeholder-[#969799]"
            />
          </div>
        </div>

        {/* Withdrawal Button */}
        <div className="flex justify-center mt-8 w-full">
          <button
            type="button"
            onClick={handleWithdrawal}
            disabled={submitLoading}
            className="w-[75%] max-w-[340px] py-3 bg-[#009688] text-white rounded-[4px] text-[14px] font-normal border-none cursor-pointer hover:bg-[#00897b] transition-colors shadow-none outline-none disabled:opacity-50"
          >
            Withdrawal
          </button>
        </div>
      </div>

      <BottomNav />
      <LoadingDialog visible={submitLoading} />
    </main>
  );
}
