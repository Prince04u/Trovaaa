"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { useToasts, ToastStack } from "@/components/ui/Toast";

export default function PublicRedEnvelopesPage() {
  const router = useRouter();
  const { toasts, push: pushToast } = useToasts();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [envelope, setEnvelope] = useState(null);
  const [isClaimed, setIsClaimed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("code");
    const cleanCode = c ? c.trim() : "";
    setCode(cleanCode);

    // Authenticate first
    const user = getUser();
    if (!user) {
      const redirectPath = cleanCode ? `/login?redirect=/redenvelopes?code=${cleanCode}` : "/login";
      router.push(redirectPath);
      return;
    }

    if (!cleanCode) {
      setErrorMsg("Invalid Red Envelope Link");
      setLoading(false);
      return;
    }

    fetchEnvelopeDetails(cleanCode);
  }, []);

  const fetchEnvelopeDetails = async (c) => {
    try {
      const res = await fetch(`/api/wallet/red-envelope/claim?code=${c}`);
      const resData = await res.json();
      if (res.ok && resData.success) {
        setEnvelope(resData.data);
      } else {
        setErrorMsg(resData.message || "Failed to load Red Envelope");
      }
    } catch (err) {
      setErrorMsg("Failed to load Red Envelope details");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (isClaimed) {
      router.push("/account");
      return;
    }

    setClaiming(true);
    try {
      const res = await fetch("/api/wallet/red-envelope/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const resData = await res.json();

      if (res.ok && resData.success) {
        setIsClaimed(true);
        pushToast("Red envelope claimed successfully!", "success");
        setTimeout(() => {
          router.push("/account");
        }, 1500);
      } else if (resData.alreadyClaimed) {
        setIsClaimed(true);
        pushToast("You have already claimed this red envelope", "error");
        setTimeout(() => {
          router.push("/account");
        }, 1500);
      } else {
        pushToast(resData.message || "Failed to claim Red Envelope", "error");
      }
    } catch (err) {
      pushToast("An error occurred. Please try again.", "error");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f5f6] flex items-center justify-center font-sans">
        <div className="text-sm text-[#999]">Loading Red Envelope...</div>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="min-h-screen bg-[#f4f5f6] pb-24 flex flex-col w-full text-center items-center justify-center font-sans px-6">
        <div className="card-surface rounded-2xl p-8 bg-white border border-[#eee] max-w-sm w-full shadow-sm">
          <span className="material-icons-outlined text-[48px] text-red-500">error_outline</span>
          <p className="text-base font-medium text-[#333] mt-3">{errorMsg}</p>
          <button
            onClick={() => router.push("/account")}
            className="w-full bg-[#009688] text-white py-2.5 rounded-lg text-sm font-medium border-none mt-6 cursor-pointer hover:opacity-90 shadow-sm"
          >
            Go to Account
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f5f6] flex flex-col w-full relative select-none text-[#333] font-sans pb-12">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 w-full shadow-sm">
        <button
          onClick={() => router.push("/account")}
          className="text-white bg-transparent border-none outline-none flex items-center cursor-pointer p-0"
        >
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </button>
        <span className="text-[17px] font-normal text-white">Red Envelopes</span>
      </nav>

      {/* Curved Background Header */}
      <div className="w-full h-[130px] bg-[#d32f2f] rounded-b-[45%] absolute top-[50px] left-0 z-0 shadow-inner"></div>

      {/* Main Claim Card */}
      <div className="flex-1 flex justify-center px-4 mt-8 relative z-10">
        <div className="w-full max-w-[350px] bg-white rounded-[12px] p-6 flex flex-col items-center shadow-lg border border-[#f0f0f0] h-[500px]">
          
          <h2 className="text-[26px] font-bold text-black mt-4 tracking-wide">Surprise</h2>

          {/* Red Envelope Pouch Illustration with Value Overlay */}
          <div className="relative w-[230px] h-[230px] my-6 flex items-center justify-center overflow-visible">
            <img
              src="/images/red_envelope_pouch.png"
              alt="Red Envelope Pouch"
              className="w-full h-full object-contain scale-[1.65]"
            />
            {/* Amount overlay on the bag */}
            <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full">
              <span className="text-[32px] font-semibold text-[#ffe082] tracking-wide font-sans drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
                ₹ {(envelope?.amount ?? 0).toFixed(2)}
              </span>
              
              {/* Success Badge overlay */}
              {isClaimed && (
                <div className="mt-4 bg-[#3e3e3e]/90 rounded-lg px-4 py-1 flex items-center justify-center border border-[#525252]/50 shadow-md">
                  <span className="text-[11px] font-semibold text-white tracking-widest">success</span>
                </div>
              )}
            </div>
          </div>

          {/* Continue Button */}
          <div className="w-full mt-auto">
            <button
              onClick={handleContinue}
              disabled={claiming}
              className="w-full bg-[#d32f2f] hover:bg-[#c62828] text-white py-3 rounded-lg font-medium text-[16px] border-none cursor-pointer shadow-md transition disabled:opacity-60 flex items-center justify-center"
            >
              {claiming ? "Claiming..." : "Continue"}
            </button>
          </div>

        </div>
      </div>

      <ToastStack toasts={toasts} />
    </main>
  );
}
