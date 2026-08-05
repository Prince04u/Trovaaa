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
import LoadingDialog from "@/components/auth/LoadingDialog";

export default function RechargePage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [channels, setChannels] = useState([]);
  const [error, setError] = useState("");
  
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeCheckoutUrl, setActiveCheckoutUrl] = useState(null);
  const [cryptoDetails, setCryptoDetails] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const PRESETS = [500, 1000, 2000, 5000, 10000, 50000];

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
    setError("");
    const parsedAmount = Number(amount);
    if (!amount || parsedAmount <= 0) {
      setError("Enter or Select recharge amount");
      return;
    }
    
    const selectedChannel = channels.find(c => c.id === paymentType);
    if (selectedChannel && (parsedAmount < selectedChannel.min || parsedAmount > selectedChannel.max)) {
      setError(`Amount must be between ₹${selectedChannel.min} and ₹${selectedChannel.max}`);
      return;
    }

    setSubmitLoading(true);
    try {
      const methodId = paymentType; // Fallback
      
      let amountToSend = parsedAmount;
      if (selectedChannel && selectedChannel.type === "crypto") {
        amountToSend = parsedAmount / 95; // 1$ = 95 INR
      }
      
      const paymentRes = await getDepositPayment(paymentType, amountToSend);
      const paymentData = paymentRes?.data || null;

      if (!paymentData) throw new Error("Failed to initialize payment details");

      if (paymentData.type === "crypto") {
        setCryptoDetails(paymentData);
        setSubmitLoading(false);
        return;
      }

      if (paymentData.checkoutUrl) {
        setActiveCheckoutUrl(paymentData.checkoutUrl);
        setSubmitLoading(false);
        return;
      }

      sessionStorage.setItem("deposit_amount", String(amountToSend));
      sessionStorage.setItem("deposit_method", methodId);
      sessionStorage.setItem("deposit_channel", paymentType);
      sessionStorage.setItem("deposit_payment_details", JSON.stringify(paymentData));
      
      router.push("/recharge");
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || "Failed to submit recharge.");
      setSubmitLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  if (cryptoDetails) {
    const networkName = cryptoDetails.payCurrency?.toUpperCase() === "USDTBSC" ? "USDT (BEP20)" : "USDT (TRC20)";
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(cryptoDetails.payAddress)}`;
    
    const handleCopy = () => {
      navigator.clipboard.writeText(cryptoDetails.payAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    };

    return (
      <main className="min-h-screen bg-white pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#333]">
        {/* Top Navbar */}
        <nav className="bg-white text-[#323233] h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 border-b border-[#ebedf0] w-full">
          <div className="flex items-center gap-4">
            <button onClick={() => setCryptoDetails(null)} className="text-[#323233] bg-transparent border-none outline-none flex items-center p-0 cursor-pointer">
              <span className="material-icons-outlined text-[24px]">arrow_back</span>
            </button>
            <span className="text-[17px] font-medium text-[#323233]">USDT Deposit Details</span>
          </div>
        </nav>

        <div className="p-6 flex flex-col gap-6 w-full max-w-md mx-auto text-center">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4">
            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Send Exact Amount</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-[#009688]">{cryptoDetails.payAmount}</span>
              <span className="text-lg font-bold text-[#009688]">USDT</span>
            </div>
            <span className="text-[13px] text-gray-400 font-medium">(₹ {amount} equivalent)</span>
            
            {/* QR Code */}
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="Deposit QR Code" className="w-[180px] h-[180px]" />
            </div>
            
            <div className="w-full flex flex-col gap-1.5 text-left mt-2">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider ml-1">Network</span>
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">
                {networkName}
              </div>
            </div>

            <div className="w-full flex flex-col gap-1.5 text-left">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider ml-1">Deposit Address</span>
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-mono text-gray-600 shadow-sm flex items-center justify-between gap-3">
                <span className="break-all select-all">{cryptoDetails.payAddress}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="bg-transparent border-none text-[#009688] hover:text-[#00796b] font-bold text-xs cursor-pointer flex items-center gap-1 flex-shrink-0"
                >
                  <span className="material-icons-outlined text-[18px]">{copiedAddress ? "done" : "content_copy"}</span>
                  <span>{copiedAddress ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 leading-relaxed px-2 flex flex-col gap-2">
            <p className="font-semibold text-amber-600 flex items-center justify-center gap-1">
              <span className="material-icons-outlined text-[16px]">warning</span>
              Do not send any other asset. Send ONLY {networkName}.
            </p>
            <p>Your deposit will be automatically credited to your balance once the transfer is confirmed on the blockchain network (usually 1-3 minutes).</p>
          </div>

          <button
            type="button"
            onClick={() => setCryptoDetails(null)}
            className="bg-[#009688] text-white py-3.5 rounded-xl font-semibold text-[15px] border-none cursor-pointer hover:opacity-95 shadow-md w-full transition"
          >
            I have completed the transfer
          </button>
        </div>
      </main>
    );
  }

  if (activeCheckoutUrl) {
    return (
      <main className="fixed inset-0 bg-white z-50 flex flex-col w-full h-full m-0 p-0 select-none text-[#333]">
        {/* Top Navbar */}
        <nav className="bg-white text-[#323233] h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 border-b border-[#ebedf0] w-full">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveCheckoutUrl(null)} 
              className="text-[#323233] bg-transparent border-none outline-none flex items-center p-0 cursor-pointer"
            >
              <span className="material-icons-outlined text-[24px]">arrow_back</span>
            </button>
            <span className="text-[17px] font-medium text-[#323233]">Secure Payment Gateway</span>
          </div>
          <button 
            onClick={() => setActiveCheckoutUrl(null)}
            className="text-[#323233] bg-white border border-[#dcdee0] outline-none text-xs font-semibold px-2.5 py-1 rounded cursor-pointer hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </nav>

        {/* Secure Checkout IFrame */}
        <div className="flex-1 w-full h-full bg-[#fcfcfc] relative overflow-hidden">
          <iframe 
            src={activeCheckoutUrl} 
            title="Payment Gateway" 
            className="w-full h-full border-none m-0 p-0 absolute inset-0"
            style={activeCheckoutUrl?.includes("nowpayments") ? {
              height: "calc(100% + 60px)",
              top: 0,
              left: 0,
              bottom: "-60px",
            } : {}}
            allow="payment"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#333]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[48px] px-4 flex items-center justify-between sticky top-0 z-10 shadow-none w-full">
        <div className="flex items-center gap-3">
          <Link href="/account" className="text-white text-decoration-none flex items-center">
            <span className="material-icons-outlined text-[22px]">arrow_back</span>
          </Link>
          <span className="text-[18px] font-normal text-white ml-1">Recharge</span>
        </div>
        <Link href="/rechargerecord" className="text-white bg-transparent border-none outline-none flex items-center p-0 cursor-pointer text-decoration-none">
          <span className="material-icons-outlined text-[22px]">menu</span>
        </Link>
      </nav>

      <div className="px-4 md:px-12 lg:px-20 py-4 flex flex-col w-full max-w-full mx-auto bg-white min-h-screen">
        {/* Balance Display */}
        <div className="text-center my-6 text-[20px] font-medium text-[#000000]">
          Balance: ₹ {balanceLoading ? "..." : balance.toFixed(2)}
        </div>

        {/* Input */}
        <div className="flex items-center bg-white rounded-[4px] px-3.5 border border-[#dcdee0] shadow-sm h-[46px] mt-1 w-full">
          {/* Circular card icon matching the reference */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3 shrink-0">
            <circle cx="10" cy="10" r="10" fill="#8f9094"/>
            <rect x="4.5" y="6" width="11" height="8" rx="1" fill="white"/>
            <rect x="4.5" y="7.5" width="11" height="2" fill="#8f9094"/>
          </svg>
          <input
            type="number"
            placeholder="Enter or Select recharge amount"
            value={amount}
            onChange={(e) => {
              setError("");
              setAmount(e.target.value);
            }}
            className="flex-1 text-[14px] outline-none font-normal text-[#323233] bg-transparent border-none placeholder-[#969799] w-full"
          />
        </div>

        {/* Presets Grid */}
        <div className="grid grid-cols-3 gap-x-3.5 md:gap-x-8 lg:gap-x-16 gap-y-2 mt-6 w-full">
          {PRESETS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                setError("");
                setAmount(String(val));
              }}
              className="py-3 rounded-[4px] text-[14px] font-normal transition-colors border-none cursor-pointer outline-none flex items-center justify-center h-[46px] w-full"
              style={{
                boxShadow: "rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px",
                background: amount === String(val) ? "#009688" : "#fafafa",
                color: amount === String(val) ? "#fff" : "#222",
                border: "none",
              }}
            >
              ₹ {val}
            </button>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="flex flex-col mt-6 w-full">
          <span className="text-[14px] text-[#757575] font-normal mb-3 ml-1">Payment</span>
          
          <div className="flex flex-col gap-3">
            {channels.map((ch) => (
              <label key={ch.id} className="flex items-center py-2 cursor-pointer w-full select-none">
                <div className="w-8 flex items-center justify-start shrink-0">
                  {paymentType === ch.id ? (
                    <span className="text-[#323233] text-[15px] font-semibold">✓</span>
                  ) : null}
                </div>
                <span className="text-[14px] text-[#323233] font-normal">{ch.label}</span>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentType === ch.id}
                  onChange={() => {
                    setError("");
                    setPaymentType(ch.id);
                  }}
                  className="hidden"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="text-[13px] text-[#e53935] text-center font-normal mt-4 px-4 py-2 bg-[#ffebee] border border-[#ffcdd2] rounded-[4px] w-full break-words">
            {error}
          </div>
        )}

        {/* Recharge Action Button */}
        <div className="flex justify-center mt-8 w-full">
          <button
            type="button"
            onClick={handleRecharge}
            disabled={submitLoading}
            className="w-full py-3.5 bg-[#009688] text-white rounded-[4px] text-[14px] font-normal border-none cursor-pointer hover:bg-[#00897b] transition-colors shadow-none outline-none disabled:opacity-50"
          >
            Recharge
          </button>
        </div>
      </div>

      <BottomNav />
      <LoadingDialog visible={submitLoading} />
    </main>
  );
}
