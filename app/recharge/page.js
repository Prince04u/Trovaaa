"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/home/BottomNav";
import { getBalance } from "@/lib/walletApi";
import { parseWalletBalance } from "@/lib/walletBalance";
import { getDepositOptions, getDepositPayment } from "@/lib/platformApi";
import { getToken } from "@/lib/auth";
import PageLoader from "@/components/brand/PageLoader";

export default function RechargePage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [channels, setChannels] = useState([]);
  
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const PRESETS = [500, 1000, 2000, 5000, 10000, 49999];

  const loadBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const res = await getBalance();
      const { available } = parseWalletBalance(res);
      setBalance(available);
    } catch (err) {
      if (err.response?.status === 401) {
        router.replace("/login");
      }
    } finally {
      setBalanceLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    
    loadBalance();
    
    getDepositOptions().then((res) => {
      const opts = res?.data?.channels?.filter(c => c.enabled) || [];
      setChannels(opts);
      if (opts.length > 0) {
        setPaymentType(opts[0].id);
      } else {
        // Fallback to dummy data if API returns none, to match the UI screenshot
        setChannels([
          { id: "winpay", label: "WinPay", min: 100, max: 50000 },
          { id: "dypay", label: "Dypay", min: 100, max: 50000 }
        ]);
        setPaymentType("winpay");
      }
      setLoading(false);
    }).catch(() => {
      setChannels([
        { id: "winpay", label: "WinPay", min: 100, max: 50000 },
        { id: "dypay", label: "Dypay", min: 100, max: 50000 }
      ]);
      setPaymentType("winpay");
      setLoading(false);
    });
  }, [router, loadBalance]);

  const handleRecharge = async (e) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!amount || parsedAmount <= 0) {
      alert("Enter or Select recharge amount");
      return;
    }
    
    const selectedChannel = channels.find(c => c.id === paymentType);
    if (selectedChannel && (parsedAmount < selectedChannel.min || parsedAmount > selectedChannel.max)) {
      alert(`Amount must be between ₹${selectedChannel.min} and ₹${selectedChannel.max}`);
      return;
    }

    setSubmitLoading(true);
    try {
      // Find method for this channel if any
      const methodId = paymentType; // Fallback
      
      let amountToSend = parsedAmount;
      if (selectedChannel.type === "crypto") {
        amountToSend = parsedAmount / 95; // 1$ = 95 INR
      }
      
      const paymentRes = await getDepositPayment(paymentType, amountToSend);
      const paymentData = paymentRes?.data || null;

      if (!paymentData) throw new Error("Failed to initialize payment details");

      if (paymentData.checkoutUrl) {
        window.location.href = paymentData.checkoutUrl;
        return;
      }

      sessionStorage.setItem("deposit_amount", String(amountToSend));
      sessionStorage.setItem("deposit_method", methodId);
      sessionStorage.setItem("deposit_channel", paymentType);
      sessionStorage.setItem("deposit_payment_details", JSON.stringify(paymentData));
      
      router.push("/recharge");
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || err.message || "Failed to submit recharge.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <main className="min-h-screen bg-white pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#333]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm w-full">
        <div className="flex items-center gap-4">
          <Link href="/account" className="text-white text-decoration-none flex items-center">
            <span className="material-icons-outlined text-[24px]">arrow_back</span>
          </Link>
          <span className="text-[17px] font-normal text-white">Recharge</span>
        </div>
        <Link href="/rechargerecord" className="text-white bg-transparent border-none outline-none flex items-center p-0 cursor-pointer text-decoration-none">
          <span className="material-icons-outlined text-[24px]">menu</span>
        </Link>
      </nav>

      <div className="p-4 flex flex-col gap-6 w-full max-w-xl mx-auto mt-2">
        {/* Balance Display */}
        <div className="text-center">
          <span className="text-xl text-[#333]">Balance: ₹ {balanceLoading ? "..." : balance.toFixed(2)}</span>
        </div>

        {/* Input */}
        <div className="flex items-center bg-white rounded-[4px] p-3" style={{ boxShadow: "rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px", height: "48px" }}>
          <span className="material-icons-outlined text-gray-500 mr-2 text-[22px]">account_balance_wallet</span>
          <input
            type="number"
            placeholder="Enter or Select recharge amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 text-sm outline-none font-normal text-[#333] bg-transparent border-none w-full"
          />
        </div>

        {/* Presets Grid */}
        <div className="grid grid-cols-2 gap-4">
          {PRESETS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(String(val))}
              className={`py-3 rounded-[4px] text-sm cursor-pointer border-none font-normal transition-colors`}
              style={{
                boxShadow: "rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px",
                background: amount === String(val) ? "#009688" : "#fafafa",
                color: amount === String(val) ? "#fff" : "#333",
              }}
            >
              ₹ {val}
            </button>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="flex flex-col mt-2">
          <span className="text-sm text-gray-500 mb-4 ml-1">Payment</span>
          
          {channels.map((ch) => (
            <label key={ch.id} className="flex items-center gap-8 py-3 cursor-pointer">
              <div className="w-5 flex justify-center">
                {paymentType === ch.id ? (
                  <span className="material-icons-outlined text-[#333] text-[20px]">check</span>
                ) : null}
              </div>
              <span className="text-[15px] text-[#333]">{ch.label}</span>
              <input
                type="radio"
                name="payment"
                checked={paymentType === ch.id}
                onChange={() => setPaymentType(ch.id)}
                className="hidden"
              />
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={handleRecharge}
          disabled={submitLoading}
          className="mt-4 bg-[#009688] text-white py-3.5 rounded-[4px] font-normal text-[16px] border-none cursor-pointer hover:bg-[#007b6f] w-full"
        >
          Recharge
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
