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
    <main className="min-h-screen bg-white pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#212121]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm w-full">
        <div className="flex items-center gap-4">
          <Link href="/account" className="text-white text-decoration-none flex items-center">
            <span className="material-icons-outlined text-[24px]">arrow_back</span>
          </Link>
          <span className="text-[20px] font-medium text-white">Withdrawal</span>
        </div>
        <Link href="/withdrawalrecord" className="text-white bg-transparent border-none outline-none flex items-center p-0 cursor-pointer text-decoration-none">
          <span className="material-icons-outlined text-[24px]">menu</span>
        </Link>
      </nav>

      <div className="p-4 flex flex-col gap-5 w-full max-w-xl mx-auto mt-2">
        {/* Balance Display */}
        <div className="text-center">
          <span className="text-[14px] text-[#333333] font-normal">Balance: ₹ </span>
          <span className="text-[24px] text-[#000000] font-normal">{balance.toFixed(2)}</span>
        </div>

        {/* Input & Fee */}
        <div>
          <div className="flex items-center bg-white rounded-[4px] p-3" style={{ boxShadow: "rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px", height: "48px" }}>
            <span className="material-icons-outlined text-[#757575] mr-2 text-[22px]">credit_card</span>
            <input
              type="number"
              placeholder="Enter withdrawal amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-[14px] outline-none font-normal text-[#333333] bg-transparent border-none w-full placeholder-[#757575]"
            />
          </div>
          <div className="text-[14px] text-[#212121] font-normal mt-4 ml-1">Fee: 0,to account {toAccountAmount}</div>
        </div>

        {/* Payout Section */}
        <div className="flex flex-col mt-2">
          <span className="text-[14px] text-[#757575] font-normal mb-4 ml-1">Payout</span>
          
          <label className="flex items-center py-2 cursor-pointer">
            <div className="w-5 flex justify-center">
              <span className="material-icons-outlined text-[#212121] text-[20px]">check</span>
            </div>
            <span className="text-[14px] text-[#212121] font-normal ml-7">Bankcard</span>
          </label>
        </div>

        {/* Details Form */}
        <div className="flex flex-col mt-4">
          <Link href="/addbankcard" className="flex items-center justify-between py-4 text-decoration-none text-[#212121]" style={{ borderBottom: "1px solid #f0f0f0" }}>
            <div className="flex items-center gap-3">
              <span className="material-icons-outlined text-[#757575] text-[22px]">credit_card</span>
              <span className="text-[14px] text-[#4e4e4e] font-normal">{selectedBank ? `${selectedBank.bankName} - ${selectedBank.accountNumber.slice(-4)}` : "Select Bank Card"}</span>
            </div>
            <span className="material-icons-outlined text-[#9e9e9e] text-[20px]">chevron_right</span>
          </Link>
          
          <div className="flex items-center gap-3 py-4" style={{ borderBottom: "1px solid #f0f0f0" }}>
            <span className="material-icons-outlined text-[#757575] text-[22px]">vpn_key</span>
            <input
              type="password"
              placeholder="Enter your login password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 text-[14px] outline-none font-normal text-[#333333] bg-transparent border-none placeholder-[#757575]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleWithdrawal}
          disabled={submitLoading}
          className="mt-6 bg-[#009688] text-white py-[14px] rounded-[4px] font-normal text-[14px] border-none cursor-pointer hover:bg-[#00897b] transition-colors w-full disabled:opacity-50"
        >
          Withdrawal
        </button>
      </div>

      <BottomNav />
      <LoadingDialog visible={submitLoading} />
    </main>
  );
}
