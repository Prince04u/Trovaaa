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

      <div className="px-6 pt-6 flex flex-col w-full max-w-2xl mx-auto bg-white">
        {/* Balance Display - Uniform Font Size matching reference photo */}
        <div className="text-center my-6 text-[22px] font-normal text-[#000000]">
          Balance: ₹ {balance.toFixed(2)}
        </div>

        {/* Input & Fee */}
        <div className="mt-1">
          <div className="flex items-center bg-white rounded-[4px] px-4 border border-[#e5e5e5] shadow-[0_1px_4px_rgba(0,0,0,0.05)] h-[48px]">
            {/* Round Circle Card Icon matching reference photo */}
            <div className="w-[20px] h-[20px] rounded-full border border-[#aaaaaa] flex items-center justify-center mr-3 shrink-0">
              <span className="material-icons-outlined text-[#aaaaaa] text-[12px]">credit_card</span>
            </div>
            <input
              type="number"
              placeholder="Enter withdrawal amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-[14px] outline-none font-normal text-[#333333] bg-transparent border-none placeholder-[#aaaaaa] w-full"
            />
          </div>
          <div className="text-[13px] text-[#666666] font-normal mt-3 mb-6 ml-1">Fee: 0,to account {toAccountAmount}</div>
        </div>

        {/* Payout Section */}
        <div className="flex flex-col mt-1">
          <span className="text-[13px] text-[#888888] font-normal mb-3 ml-1">Payout</span>
          
          <div className="flex items-center py-1">
            <span className="material-icons-outlined text-[#333333] text-[18px]">check</span>
            <span className="text-[14px] text-[#333333] font-normal ml-6">Bankcard</span>
          </div>
        </div>

        {/* Details Form */}
        <div className="flex flex-col mt-4">
          <Link href="/addbankcard" className="flex items-center justify-between py-3.5 text-decoration-none border-b border-[#f0f0f0]">
            <div className="flex items-center gap-3">
              <span className="material-icons-outlined text-[#888888] text-[20px]">credit_card</span>
              <span className="text-[14px] text-[#666666] font-normal">{selectedBank ? `${selectedBank.bankName} - ${selectedBank.accountNumber.slice(-4)}` : "Select Bank Card"}</span>
            </div>
            <span className="material-icons-outlined text-[#bbbbbb] text-[18px]">keyboard_arrow_down</span>
          </Link>
          
          <div className="flex items-center gap-3 py-3.5 border-b border-[#f0f0f0]">
            <span className="material-icons-outlined text-[#888888] text-[20px]">vpn_key</span>
            <input
              type="password"
              placeholder="Enter your login password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 text-[14px] outline-none font-normal text-[#333333] bg-transparent border-none placeholder-[#aaaaaa]"
            />
          </div>
        </div>

        {/* Centered Withdrawal Button */}
        <div className="flex justify-center mt-10 w-full">
          <button
            type="button"
            onClick={handleWithdrawal}
            disabled={submitLoading}
            className="w-[75%] max-w-[340px] py-2.5 bg-[#009688] text-white rounded-[4px] text-[15px] font-normal border-none cursor-pointer hover:bg-[#00897b] transition-colors shadow-none outline-none disabled:opacity-50"
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
