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

const T = {
  EN: {
    title: "Secure Payment Gateway",
    paymentId: "Payment ID",
    rateText: "After that time the rate will update",
    addressTab: "Address",
    withAmountTab: "With amount",
    amountText: "Amount",
    addressText: "Address",
    networkBsc: "Send USDT on the BSC blockchain",
    networkTron: "Send USDT on the TRON blockchain",
    depositWith: "Deposit with",
    notesTitle: "Key things to note",
    note1: "We recommend staying on this page until the payment is completed",
    note2: "Fixed-rate payments require the exact amount and must be sent before the timer expires",
    note3: "Payments below the minimum amount can't be processed",
    note4: "Completed payments are non-refundable",
    stepWaiting: "Waiting for payment",
    stepProcessing: "Processing payment",
    stepSuccess: "Success!",
    txidPlaceholder: "Enter Transaction ID (TxID)",
    uploadText: "Upload Payment Proof Screenshot",
    submittingText: "Submitting...",
    submitText: "Submit Deposit",
    copied: "Copied!",
    uploading: "Uploading..."
  },
  HN: {
    title: "सुरक्षित भुगतान गेटवे",
    paymentId: "भुगतान आईडी",
    rateText: "उक्त समय के बाद दर अपडेट हो जाएगी",
    addressTab: "पता",
    withAmountTab: "राशि के साथ",
    amountText: "राशि",
    addressText: "पता",
    networkBsc: "BSC ब्लॉकचेन पर USDT भेजें",
    networkTron: "TRON ब्लॉकचेन पर USDT भेजें",
    depositWith: "इसके साथ जमा करें",
    notesTitle: "ध्यान रखने योग्य मुख्य बातें",
    note1: "भुगतान पूरा होने तक हम इस पृष्ठ पर बने रहने की सलाह देते हैं",
    note2: "नियत-दर भुगतानों के लिए सटीक राशि की आवश्यकता होती है और समय समाप्त होने से पहले भेजी जानी चाहिए",
    note3: "न्यूनतम राशि से कम के भुगतान संसाधित नहीं किए जा सकते",
    note4: "पूरे हो चुके भुगतान गैर-वापसीयोग्य हैं",
    stepWaiting: "भुगतान की प्रतीक्षा है",
    stepProcessing: "भुगतान संसाधित हो रहा है",
    stepSuccess: "सफलता!",
    txidPlaceholder: "ट्रांजैक्शन आईडी (TxID) दर्ज करें",
    uploadText: "भुगतान प्रमाण स्क्रीनशॉट अपलोड करें",
    submittingText: "सबमिट हो रहा है...",
    submitText: "जमा सबमिट करें",
    copied: "कॉपी किया गया!",
    uploading: "अपलोड हो रहा है..."
  }
};

const formatTimeLeft = (sec) => {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export default function RechargePage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [channels, setChannels] = useState([]);
  const [error, setErrorState] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg, duration = 2000) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, duration);
  };

  const setError = (msg) => {
    setErrorState(msg);
    if (msg) {
      triggerToast(msg);
    }
  };

  
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeCheckoutUrl, setActiveCheckoutUrl] = useState(null);
  const [cryptoDetails, setCryptoDetails] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lang, setLang] = useState("EN");
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins
  const [txid, setTxid] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [depositStatusStep, setDepositStatusStep] = useState("waiting"); // 'waiting', 'processing', 'success'

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get("id");
    if (!idParam) return;

    const loadPendingDeposit = async () => {
      setSubmitLoading(true);
      try {
        const res = await getDepositPayment(undefined, undefined, idParam);
        if (res?.success && res.data?.checkoutUrl) {
          setActiveCheckoutUrl(res.data.checkoutUrl);
        }
      } catch (err) {
        console.error("Failed to load pending deposit:", err);
      } finally {
        setSubmitLoading(false);
      }
    };
    loadPendingDeposit();
  }, []);

  const handleCloseCheckout = () => {
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/recharge");
    }
    setActiveCheckoutUrl(null);
  };

  useEffect(() => {
    if (!cryptoDetails) return;
    setTimeLeft(900);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cryptoDetails]);

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
      if (selectedChannel.type === "crypto" && parsedAmount < selectedChannel.min) {
        setError("To little money");
      } else {
        setError(`Amount must be between ₹${selectedChannel.min} and ₹${selectedChannel.max}`);
      }
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

      setSubmitLoading(false);

      if (paymentData.type === "crypto") {
        setCryptoDetails(paymentData);
        return;
      }

      if (paymentData.checkoutUrl) {
        if (typeof window !== "undefined") {
          window.location.href = `/api/wallet/checkout-proxy?url=${encodeURIComponent(paymentData.checkoutUrl)}`;
        }
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



  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingProof(true);
    setError("");
    const formData = new FormData();
    formData.append("proof", file);

    try {
      const token = getToken();
      const response = await fetch("/api/wallet/deposit/proof", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setProofUrl(data.data.proofPath);
      } else {
        setError(data.message || "Failed to upload screenshot");
      }
    } catch (err) {
      setError("Failed to upload screenshot");
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSubmitDeposit = async () => {
    if (!txid.trim()) {
      setError(lang === "EN" ? "Please enter Transaction ID (TxID)" : "कृपया ट्रांजैक्शन आईडी (TxID) दर्ज करें");
      return;
    }
    if (!proofUrl) {
      setError(lang === "EN" ? "Please upload payment proof screenshot" : "कृपया भुगतान प्रमाण स्क्रीनशॉट अपलोड करें");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = getToken();
      const response = await fetch("/api/wallet/deposit/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: cryptoDetails.inrAmount,
          method: cryptoDetails.payCurrency?.toLowerCase().includes("bep20") ? "usdt_bsc" : "usdt_trc",
          reference: txid,
          proofUrl: proofUrl,
          depositId: cryptoDetails.depositId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setDepositStatusStep("processing");
        // Show success layout after 1.5 seconds
        setTimeout(() => {
          setDepositStatusStep("success");
          setSubmitting(false);
        }, 1500);
      } else {
        setError(data.message || "Failed to submit deposit request");
        setSubmitting(false);
      }
    } catch (err) {
      setError("Failed to submit deposit request");
      setSubmitting(false);
    }
  };

  if (cryptoDetails) {
    const formattedPayAmount = Math.round(Number(cryptoDetails.payAmount) * 100000) / 100000;
    if (depositStatusStep === "success") {
      const t = T[lang];
      return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-[#333]">
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-md max-w-md w-full text-center flex flex-col items-center gap-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center border-4 border-green-500 animate-bounce">
              <span className="material-icons-outlined text-green-500 text-3xl font-bold">check</span>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-black text-gray-800">
                {lang === "EN" ? "Deposit Request Submitted" : "जमा अनुरोध सबमिट हो गया"}
              </h1>
              <p className="text-xs text-gray-500 font-medium leading-relaxed px-4">
                {lang === "EN" 
                  ? "Your transaction has been received and is being verified. Funds will reflect in your account balance in 5-10 minutes."
                  : "आपका लेन-देन प्राप्त हो गया है और उसकी पुष्टि की जा रही है। 5-10 मिनट में शेष राशि आपके खाते में जुड़ जाएगी।"}
              </p>
            </div>

            <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-left flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>{t.paymentId}:</span>
                <span className="text-gray-800 font-bold">{cryptoDetails.depositId}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>{t.amountText}:</span>
                <span className="text-gray-800 font-bold">₹ {cryptoDetails.inrAmount}.00</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>TXID:</span>
                <span className="text-gray-800 font-mono font-bold truncate max-w-[180px]">{txid}</span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3 mt-2">
              <button
                onClick={() => router.push("/account")}
                className="bg-[#009688] hover:bg-[#00796b] text-white py-3.5 rounded-xl font-bold text-sm border-none cursor-pointer w-full shadow transition"
              >
                {lang === "EN" ? "Go to Account" : "खाते पर जाएं"}
              </button>
              <button
                onClick={() => router.push("/")}
                className="bg-transparent text-gray-500 hover:text-gray-700 py-2.5 rounded-xl font-bold text-xs border-none cursor-pointer w-full transition"
              >
                {lang === "EN" ? "Back to Games" : "खेलों पर वापस जाएं"}
              </button>
            </div>
          </div>
        </main>
      );
    }

    const t = T[lang];
    const isBsc = cryptoDetails.payCurrency?.toLowerCase().includes("bep20") || cryptoDetails.payCurrency?.toLowerCase().includes("bsc");
    const networkLabel = isBsc ? "BSC" : "TRC20";
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(cryptoDetails.payAddress)}`;

    const handleCopyText = (text) => {
      navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    };

    return (
      <main className="min-h-screen bg-gray-50 flex flex-col w-full m-0 p-0 text-[#333]">
        {/* Top Navbar */}
        <nav className="bg-white h-[60px] px-6 flex items-center justify-between sticky top-0 z-10 border-b border-[#ebedf0] w-full">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCryptoDetails(null)} 
              className="text-[#323233] bg-transparent border-none outline-none flex items-center p-0 cursor-pointer"
            >
              <span className="material-icons-outlined text-[24px]">arrow_back</span>
            </button>
            <span className="text-[17px] font-semibold text-gray-800">{t.title}</span>
          </div>
          
          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setLang(lang === "EN" ? "HN" : "EN")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 outline-none select-none"
            >
              <span className="text-base">{lang === "EN" ? "🇬🇧 EN" : "🇮🇳 HN"}</span>
              <span className="material-icons-outlined text-xs">expand_more</span>
            </button>
          </div>
        </nav>

        <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
          {/* Left / Center: Payment Details Card */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Payment ID bar */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
              <span>{t.paymentId}:</span>
              <span className="text-gray-800 font-bold">{cryptoDetails.depositId}</span>
              <button 
                onClick={() => handleCopyText(cryptoDetails.depositId)}
                className="bg-transparent border-none text-gray-400 cursor-pointer flex items-center"
              >
                <span className="material-icons-outlined text-base">content_copy</span>
              </button>
            </div>

            {/* Main content box */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center gap-6">
              {/* Timer status */}
              <div className="w-full bg-orange-50 border border-orange-100 rounded-xl px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
                {/* Visual Orange Progress Bar */}
                <div 
                  className="absolute bottom-0 left-0 h-[3px] bg-orange-500 transition-all duration-1000"
                  style={{ width: `${(timeLeft / 900) * 100}%` }}
                />
                <span className="text-orange-700 text-sm font-semibold">{t.rateText}</span>
                <div className="flex items-center gap-1.5 text-orange-600 font-bold text-lg">
                  <span className="material-icons-outlined">schedule</span>
                  <span>{formatTimeLeft(timeLeft)}</span>
                </div>
              </div>

              {/* Tabs selector */}
              <div className="flex items-center justify-center gap-2 p-1 bg-gray-100 rounded-xl w-[260px]">
                <button className="flex-1 py-2 text-sm font-semibold rounded-lg bg-white shadow-sm border-none cursor-pointer text-gray-800">
                  {t.addressTab}
                </button>
                <button className="flex-1 py-2 text-sm font-semibold rounded-lg bg-transparent border-none cursor-not-allowed text-gray-400">
                  {t.withAmountTab}
                </button>
              </div>

              {/* QR Code and Details */}
              <div className="flex flex-col md:flex-row items-center gap-6 w-full mt-2">
                {/* QR Code wrapper */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-md flex-shrink-0 relative">
                  <img src={qrUrl} alt="Deposit QR Code" className="w-[180px] h-[180px] block" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" alt="USDT" className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Details layout */}
                <div className="flex-1 w-full flex flex-col gap-4">
                  {/* Amount detail */}
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t.amountText}</span>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-gray-800">{formattedPayAmount}</span>
                        <span className="text-sm font-bold text-gray-500">USDT</span>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded ml-1.5">{networkLabel}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-500">~ ₹{cryptoDetails.inrAmount}</span>
                      <button 
                        onClick={() => handleCopyText(String(formattedPayAmount))}
                        className="bg-transparent border-none text-[#009688] font-bold text-xs cursor-pointer flex items-center gap-0.5"
                      >
                        <span className="material-icons-outlined text-base">content_copy</span>
                      </button>
                    </div>
                  </div>

                  {/* Address detail */}
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t.addressText}</span>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                      <span className="break-all font-mono text-xs text-gray-600 select-all leading-relaxed flex-1">
                        {cryptoDetails.payAddress}
                      </span>
                      <button 
                        onClick={() => handleCopyText(cryptoDetails.payAddress)}
                        className="bg-transparent border-none text-[#009688] font-bold text-xs cursor-pointer flex items-center gap-0.5 flex-shrink-0"
                      >
                        <span className="material-icons-outlined text-base">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain info note */}
              <div className="w-full text-center py-2 text-xs text-gray-500 font-medium border-t border-gray-50">
                {isBsc ? t.networkBsc : t.networkTron}
              </div>

              {/* Deposit with icons */}
              <div className="flex flex-col items-center gap-2 mt-2">
                <span className="text-xs text-gray-400 font-semibold">{t.depositWith}</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-gray-100 bg-white flex items-center justify-center p-1.5 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-10 h-10 rounded-xl border border-gray-100 bg-white flex items-center justify-center p-1.5 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/trustwallet.png" alt="TrustWallet" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>

              {/* Error messages */}
              {error && (
                <div className="w-full bg-red-50 text-red-600 text-xs py-3 px-4 rounded-xl text-left font-semibold border border-red-100 flex items-center gap-1.5">
                  <span className="material-icons-outlined text-base">error_outline</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Transaction Hash Input and Upload Area */}
              <div className="w-full border-t border-gray-100 pt-6 flex flex-col gap-4">
                {/* TxID field */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">TXID / Tx Hash</span>
                  <input 
                    type="text" 
                    value={txid} 
                    onChange={(e) => setTxid(e.target.value)}
                    placeholder={t.txidPlaceholder}
                    disabled={submitting || depositStatusStep !== "waiting"}
                    className="w-full border border-gray-200 focus:border-[#009688] outline-none rounded-xl px-4 py-3 text-sm text-gray-800 shadow-sm transition"
                  />
                </div>

                {/* Upload Proof field */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">{t.uploadText}</span>
                  <div className="relative border-2 border-dashed border-gray-200 hover:border-[#009688] rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition bg-gray-50/50">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      disabled={uploadingProof || submitting || depositStatusStep !== "waiting"}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {proofUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={proofUrl} alt="Uploaded Proof" className="w-[120px] h-[80px] object-cover rounded-lg border border-gray-100 shadow" />
                        <span className="text-xs text-green-600 font-bold flex items-center gap-0.5">
                          <span className="material-icons-outlined text-base">check_circle</span>
                          Uploaded Successfully
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-gray-400">
                        <span className="material-icons-outlined text-3xl">{uploadingProof ? "hourglass_top" : "cloud_upload"}</span>
                        <span className="text-xs font-semibold">{uploadingProof ? t.uploading : "Choose Image (PNG/JPG)"}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={handleSubmitDeposit}
                  disabled={submitting || uploadingProof || depositStatusStep !== "waiting"}
                  className="bg-[#009688] hover:bg-[#00796b] text-white py-3.5 rounded-xl font-bold text-[15px] border-none cursor-pointer shadow-md w-full transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting && <span className="material-icons-outlined animate-spin text-[18px]">autorenew</span>}
                  <span>{submitting ? t.submittingText : t.submitText}</span>
                </button>
              </div>
            </div>

            {/* Key Notes Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-left">
              <span className="text-gray-800 text-sm font-bold block mb-4 border-b border-gray-50 pb-2">{t.notesTitle}</span>
              <div className="flex flex-col gap-3">
                {[t.note1, t.note2, t.note3, t.note4].map((note, index) => (
                  <div key={index} className="flex items-start gap-2.5 text-xs text-gray-500 font-medium leading-relaxed">
                    <span className={`material-icons-outlined text-base mt-0.5 shrink-0 ${index < 2 ? "text-[#009688]" : "text-red-400"}`}>
                      {index < 2 ? "check_circle" : "cancel"}
                    </span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Payment Status Sidebar */}
          <div className="w-full lg:w-[280px] shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-[84px] text-left flex flex-col gap-6">
              <span className="text-gray-800 text-sm font-bold block border-b border-gray-50 pb-2">Status</span>
              
              {/* Stepper */}
              <div className="flex flex-col gap-6 pl-4 relative before:absolute before:left-[11px] before:top-[8px] before:bottom-[8px] before:w-[2px] before:bg-gray-100">
                {/* Step 1 */}
                <div className="flex items-center gap-4 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border z-10 ${
                    depositStatusStep === "waiting" 
                      ? "bg-blue-50 border-blue-500 text-blue-500" 
                      : "bg-green-500 border-green-500 text-white"
                  }`}>
                    {depositStatusStep !== "waiting" ? "✓" : "1"}
                  </div>
                  <span className={`text-xs font-semibold ${depositStatusStep === "waiting" ? "text-blue-500 font-bold" : "text-gray-400"}`}>
                    {t.stepWaiting}
                  </span>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border z-10 ${
                    depositStatusStep === "processing" 
                      ? "bg-blue-50 border-blue-500 text-blue-500 animate-pulse" 
                      : depositStatusStep === "success"
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-white border-gray-200 text-gray-400"
                  }`}>
                    {depositStatusStep === "success" ? "✓" : "2"}
                  </div>
                  <span className={`text-xs font-semibold ${depositStatusStep === "processing" ? "text-blue-500 font-bold" : "text-gray-400"}`}>
                    {t.stepProcessing}
                  </span>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border z-10 ${
                    depositStatusStep === "success" 
                      ? "bg-green-500 border-green-500 text-white" 
                      : "bg-white border-gray-200 text-gray-400"
                  }`}>
                    3
                  </div>
                  <span className={`text-xs font-semibold ${depositStatusStep === "success" ? "text-green-500 font-bold" : "text-gray-400"}`}>
                    {t.stepSuccess}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {copiedAddress && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800/90 text-white text-xs px-4 py-2 rounded-lg z-50 shadow font-semibold">
            {t.copied}
          </div>
        )}
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
              onClick={handleCloseCheckout} 
              className="text-[#323233] bg-transparent border-none outline-none flex items-center p-0 cursor-pointer"
            >
              <span className="material-icons-outlined text-[24px]">arrow_back</span>
            </button>
            <span className="text-[17px] font-medium text-[#323233]">Secure Payment Gateway</span>
          </div>
          <button 
            onClick={handleCloseCheckout}
            className="text-[#323233] bg-white border border-[#dcdee0] outline-none text-xs font-semibold px-2.5 py-1 rounded cursor-pointer hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </nav>

        {/* Secure Checkout IFrame */}
        <div className="flex-1 w-full h-full bg-[#fcfcfc] relative overflow-hidden" style={{ height: "100%" }}>
          <iframe 
            src={activeCheckoutUrl} 
            title="Payment Gateway" 
            className="w-full border-none m-0 p-0 absolute inset-0"
            style={{ height: "calc(100% + 75px)" }}
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
                <span className="text-[14px] text-[#323233] font-normal">
                  {ch.label.replace(/trc20/i, 'TRC20').replace(/bep20/i, 'BEP20')}
                </span>
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
      {loading && <PageLoader />}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-[#4c4c4c] text-white text-[15px] font-normal py-2.5 px-7 rounded-[10px] shadow-lg shadow-black/10 pointer-events-none select-none">
          Success
        </div>
      )}

      {/* General Toast */}
      {showToast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-[#4c4c4c]/95 text-white text-[13.5px] font-normal py-2 px-5 rounded-[8px] shadow-md shadow-black/10 pointer-events-none select-none text-center min-w-[110px]">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
