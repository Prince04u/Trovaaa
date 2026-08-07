"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, getToken } from "@/lib/auth";
import { useToasts, ToastStack } from "@/components/ui/Toast";
import LoadingDialog from "@/components/auth/LoadingDialog";

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

    const checkAuthAndFetch = async () => {
      let user = getUser();
      if (!user) {
        // Fallback: Check if user is authenticated via cookie
        try {
          const res = await fetch("/api/users/me");
          const resData = await res.json();
          if (res.ok && resData.success) {
            // Restore local storage session
            const { setUser, setToken } = await import("@/lib/auth");
            setUser(resData.data);
            setToken("cookie_authenticated");
            user = resData.data;
          }
        } catch (e) {
          console.error("Cookie authentication fallback check failed", e);
        }
      }

      if (!cleanCode) {
        setErrorMsg("Invalid Red Envelope Link");
        setLoading(false);
        return;
      }

      await fetchEnvelopeDetails(cleanCode);
    };

    checkAuthAndFetch();
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
    const user = getUser();
    if (!user) {
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (isClaimed) {
      router.push("/account");
      return;
    }

    setClaiming(true);
    try {
      const token = getToken();
      const res = await fetch("/api/wallet/red-envelope/claim", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ code }),
      });
      const resData = await res.json();

      if (res.ok && resData.success) {
        setIsClaimed(true);
        pushToast("success", "success");
        setTimeout(() => {
          router.push("/account");
        }, 1500);
      } else if (resData.alreadyClaimed) {
        setIsClaimed(true);
        pushToast("Has been received", "error");
        setTimeout(() => {
          router.push("/account");
        }, 1500);
      } else {
        let finalMsg = resData.message || "Failed to claim Red Envelope";
        if (finalMsg.toLowerCase().includes("specific") || finalMsg.toLowerCase().includes("parameter")) {
          finalMsg = 'Invalid "red envelope "';
        } else if (finalMsg.toLowerCase().includes("fully") || finalMsg.toLowerCase().includes("already been claimed")) {
          finalMsg = "Has been received";
        }
        pushToast(finalMsg, "error");
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
        <LoadingDialog visible={true} />
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
        <div className="w-full max-w-[340px] bg-white rounded-[16px] p-8 pt-6 flex flex-col items-center shadow-lg border border-[#eee] self-start mt-12">
          <h2 className="text-[22px] font-bold text-[#111] mt-0 mb-2 tracking-wide text-center w-full">Surprise</h2>

          {/* Red Envelope Pouch Illustration with Value Overlay */}
          <div className="relative w-[250px] h-[250px] my-4 flex items-center justify-center">
            <img
              src="/images/red_envelope_pouch.png"
              alt="Red Envelope Pouch"
              className="w-full h-full object-contain mix-blend-multiply"
            />
            {/* Amount overlay on the bag */}
            <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full">
              <span className="font-bold tracking-wide font-sans drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.65)] select-all bg-gradient-to-t from-[#f4d497] to-[#fff] bg-clip-text text-transparent">
                <span className="text-[17px] mr-0.5">₹</span>
                <span className="text-[26px]">{(envelope?.amount ?? 0).toFixed(2)}</span>
              </span>
            </div>
          </div>

          {/* Continue Button */}
          <div className="w-full mt-6">
            <button
              onClick={handleContinue}
              disabled={claiming}
              className="w-full bg-[#d32f2f] hover:bg-[#c62828] text-white py-3 rounded-lg font-semibold text-[15px] border-none cursor-pointer shadow-md transition disabled:opacity-60 flex items-center justify-center"
            >
              Continue
            </button>
          </div>

        </div>
      </div>

      <LoadingDialog visible={claiming} />
      <ToastStack toasts={toasts} />
    </main>
  );
}
