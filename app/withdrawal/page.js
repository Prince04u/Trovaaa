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
      await requestWithdraw(Number(amount), "bank", bankAccountId, password);
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

  return (
    <main className="min-h-screen bg-white pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#333]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm w-full">
        <div className="flex items-center gap-4">
          <Link href="/account" className="text-white text-decoration-none flex items-center">
            <span className="material-icons-outlined text-[24px]">arrow_back</span>
          </Link>
          <span className="text-[17px] font-normal text-white">Withdrawal</span>
        </div>
        <Link href="/withdrawalrecord" className="text-white bg-transparent border-none outline-none flex items-center p-0 cursor-pointer text-decoration-none">
          <span className="material-icons-outlined text-[24px]">menu</span>
        </Link>
      </nav>

      <div className="p-4 flex flex-col gap-5 w-full max-w-xl mx-auto mt-2">
        {/* Balance Display */}
        <div className="text-center">
          <span className="text-xl text-[#333]">Balance: ₹ {balance.toFixed(2)}</span>
        </div>

        {/* Input */}
        <div>
          <div className="flex items-center bg-white rounded-[4px] p-3" style={{ boxShadow: "rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px", height: "48px" }}>
            <span className="material-icons-outlined text-gray-500 mr-2 text-[22px]">credit_card</span>
            <input
              type="number"
              placeholder="Enter withdrawal amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-sm outline-none font-normal text-[#333] bg-transparent border-none w-full"
            />
          </div>
          <div className="text-sm text-[#333] mt-4 ml-1">Fee: 0,to account 0</div>
        </div>

        {/* Payout Methods */}
        <div className="flex flex-col mt-2">
          <span className="text-sm text-gray-500 mb-4 ml-1">Payout</span>
          
          <label className="flex items-center gap-8 py-2 cursor-pointer">
            <div className="w-5 flex justify-center">
              <span className="material-icons-outlined text-[#333] text-[20px]">check</span>
            </div>
            <span className="text-[15px] text-[#333]">Bankcard</span>
          </label>
        </div>

        {/* Details Form */}
        <div className="flex flex-col mt-4">
          <Link href="/addbankcard" className="flex items-center justify-between py-4 text-decoration-none text-[#333]" style={{ borderBottom: "1px solid #f0f0f0" }}>
            <div className="flex items-center gap-3">
              <span className="material-icons-outlined text-gray-500 text-[22px]">credit_card</span>
              <span className="text-[14px]">{selectedBank ? `${selectedBank.bankName} - ${selectedBank.accountNumber.slice(-4)}` : "Select Bank Card"}</span>
            </div>
            <span className="material-icons-outlined text-gray-400 text-[20px]">chevron_right</span>
          </Link>
          
          <div className="flex items-center gap-3 py-4" style={{ borderBottom: "1px solid #f0f0f0" }}>
            <span className="material-icons-outlined text-gray-500 text-[22px]">vpn_key</span>
            <input
              type="password"
              placeholder="Enter your login password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 text-[14px] outline-none font-normal text-[#333] bg-transparent border-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleWithdrawal}
          disabled={submitLoading}
          className="mt-6 bg-[#009688] text-white py-3.5 rounded-sm font-normal text-[16px] border-none cursor-pointer hover:opacity-90 w-full disabled:opacity-50"
        >
          {submitLoading ? "Processing..." : "Withdrawal"}
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
