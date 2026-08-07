"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/home/BottomNav";
import { getUser, getToken } from "@/lib/auth";
import { useToasts, ToastStack } from "@/components/ui/Toast";
import LoadingDialog from "@/components/auth/LoadingDialog";

export default function RedEnvelopePage() {
  const router = useRouter();
  const { toasts, push: pushToast } = useToasts();

  // App views: "list" | "add" | "claim"
  const [view, setView] = useState("list");
  
  // Launch state
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [launchLoading, setLaunchLoading] = useState(false);
  const [userHasPermission, setUserHasPermission] = useState(false);
  const [myEnvelopes, setMyEnvelopes] = useState([]);

  // Claim State
  const [claimCode, setClaimCode] = useState(null);
  const [claimLoading, setClaimLoading] = useState(true);
  const [claimEnvelope, setClaimEnvelope] = useState(null);
  const [isClaimed, setIsClaimed] = useState(false);
  const [claimingState, setClaimingState] = useState(false);
  const [claimError, setClaimError] = useState("");

  useEffect(() => {
    // 1. Check if we have a claim code in URL query parameters
    const params = new URLSearchParams(window.location.search);
    const codeInUrl = params.get("code");

    const checkAuthAndInit = async () => {
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

      if (!user) {
        if (codeInUrl) {
          router.push(`/login?redirect=${encodeURIComponent(`/redenvelope?code=${codeInUrl}`)}`);
        } else {
          router.push("/login");
        }
        return;
      }

      if (codeInUrl) {
        setClaimCode(codeInUrl);
        setView("claim");
        fetchClaimEnvelopeDetails(codeInUrl);
      } else {
        checkPermission();
        fetchMyEnvelopes();
      }
    };

    checkAuthAndInit();
  }, []);

  const checkPermission = async () => {
    try {
      // In getUser info we check permissions
      const user = getUser();
      // Fetch fresh status or check user object
      const token = getToken();
      const res = await fetch("/api/users/me", {
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setUserHasPermission(!!resData.data.canCreateRedEnvelope);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMyEnvelopes = async () => {
    try {
      const token = getToken();
      const res = await fetch("/api/wallet/red-envelope/my", {
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setMyEnvelopes(resData.data);
      }
    } catch (e) {
      console.error("Failed to load user envelopes", e);
    }
  };

  const fetchClaimEnvelopeDetails = async (code) => {
    setClaimLoading(true);
    try {
      const res = await fetch(`/api/wallet/red-envelope/claim?code=${code}`);
      const resData = await res.json();
      if (res.ok && resData.success) {
        setClaimEnvelope(resData.data);
      } else {
        setClaimError(resData.message || "Failed to load Red Envelope details");
      }
    } catch (err) {
      setClaimError("Failed to load Red Envelope details");
    } finally {
      setClaimLoading(false);
    }
  };

  const handleLaunch = async (e) => {
    e.preventDefault();
    if (!userHasPermission) {
      pushToast("You don't have permission to launch a red envelope.", "error");
      return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      pushToast("Please enter a valid amount.", "error");
      return;
    }
    if (!password) {
      pushToast("Password is required.", "error");
      return;
    }

    setLaunchLoading(true);
    try {
      const token = getToken();
      const res = await fetch("/api/wallet/red-envelope/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ amount, password }),
      });
      const resData = await res.json();

      if (res.ok && resData.success) {
        pushToast("Red envelope launched successfully!", "success");
        setAmount("");
        setPassword("");
        setView("list");
        fetchMyEnvelopes();
      } else {
        pushToast(resData.message || "Failed to launch red envelope.", "error");
      }
    } catch (err) {
      pushToast("An error occurred during launch.", "error");
    } finally {
      setLaunchLoading(false);
    }
  };

  const handleClaimContinue = async () => {
    if (isClaimed) {
      router.push("/account");
      return;
    }

    setClaimingState(true);
    try {
      const token = getToken();
      const res = await fetch("/api/wallet/red-envelope/claim", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ code: claimCode }),
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
        pushToast("Already claimed", "error");
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
      setClaimingState(false);
    }
  };

  const getShareableUrl = (envelopeCode) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/redenvelopes?code=${envelopeCode}`;
    }
    return `/redenvelopes?code=${envelopeCode}`;
  };

  const copyLink = (code) => {
    navigator.clipboard.writeText(getShareableUrl(code));
    pushToast("Shareable link copied to clipboard!", "success");
  };

  // ─── CLAIM VIEW RENDER ───
  if (view === "claim") {
    if (claimLoading) {
      return (
        <main className="min-h-screen bg-[#f4f5f6] flex items-center justify-center font-sans">
          <LoadingDialog visible={true} />
        </main>
      );
    }

    if (claimError) {
      return (
        <main className="min-h-screen bg-[#f4f5f6] pb-24 flex flex-col w-full text-center items-center justify-center font-sans px-6">
          <div className="card-surface rounded-2xl p-8 bg-white border border-[#eee] max-w-sm w-full shadow-sm">
            <span className="material-icons-outlined text-[48px] text-red-500">error_outline</span>
            <p className="text-base font-medium text-[#333] mt-3">{claimError}</p>
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

            {/* Red Envelope Pouch Illustration */}
            <div className="relative w-[250px] h-[250px] my-4 flex items-center justify-center">
              <img
                src="/images/red_envelope_pouch.png"
                alt="Red Envelope"
                className="w-full h-full object-contain mix-blend-multiply"
              />
              <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full">
                <span className="font-bold tracking-wide font-sans drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.65)] select-all bg-gradient-to-t from-[#f4d497] to-[#fff] bg-clip-text text-transparent">
                  <span className="text-[17px] mr-0.5">₹</span>
                  <span className="text-[26px]">{(claimEnvelope?.amount ?? 0).toFixed(2)}</span>
                </span>
              </div>
            </div>

            {/* Continue Button */}
            <div className="w-full mt-6">
              <button
                onClick={handleClaimContinue}
                disabled={claimingState}
                className="w-full bg-[#d32f2f] hover:bg-[#c62828] text-white py-3 rounded-lg font-semibold text-[15px] border-none cursor-pointer shadow-md transition disabled:opacity-60 flex items-center justify-center"
              >
                Continue
              </button>
            </div>

          </div>
        </div>

        <LoadingDialog visible={claimingState} />
        <ToastStack toasts={toasts} />
      </main>
    );
  }

  // ─── STANDARD LIST / LAUNCH VIEW ───
  return (
    <main className="min-h-screen bg-white pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#333] font-sans">
      {view === "list" ? (
        <>
          {/* Top Navbar */}
          <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 w-full shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/account")}
                className="text-white bg-transparent border-none outline-none flex items-center cursor-pointer p-0"
              >
                <span className="material-icons-outlined text-[24px]">arrow_back</span>
              </button>
              <span className="text-[17px] font-normal text-white">RedEnvelope</span>
            </div>
            {userHasPermission && (
              <button
                onClick={() => setView("add")}
                className="text-white bg-transparent border-none outline-none flex items-center cursor-pointer p-0"
              >
                <span className="material-icons-outlined text-[26px]">add</span>
              </button>
            )}
          </nav>

          {/* List Content */}
          <div className="flex flex-col flex-1 bg-white">
            {myEnvelopes.length === 0 ? (
              <div className="py-8 text-center text-[#999] text-[13px] font-medium border-b border-[#eee]">
                No data available
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#eee]">
                {myEnvelopes.map((env) => (
                  <div key={env.id} className="flex justify-between items-center px-4 py-3.5 text-sm">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono font-bold text-[#009688]">{env.code}</span>
                      <span className="text-xs text-[#999]">{new Date(env.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[#333]">₹{env.amount}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-[#009688] font-medium">
                        {env.claimedCount} / {env.maxClaims} Claims
                      </span>
                      <button
                        onClick={() => copyLink(env.code)}
                        className="text-xs border border-[#009688] text-[#009688] bg-transparent px-2.5 py-1 rounded hover:bg-teal-50 cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Top Navbar */}
          <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 w-full shadow-sm">
            <button
              onClick={() => setView("list")}
              className="text-white bg-transparent border-none outline-none flex items-center cursor-pointer p-0"
            >
              <span className="material-icons-outlined text-[24px]">arrow_back</span>
            </button>
            <span className="text-[17px] font-normal text-white">Add Red Envelope</span>
          </nav>

          {/* Add Form */}
          <form onSubmit={handleLaunch} className="flex flex-col w-full bg-white px-4 py-6 gap-5 animate-fade-in">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#adadad] font-normal">Fixed Money (₹)</label>
              <input
                type="number"
                value={amount}
                placeholder="Enter amount to load in envelope"
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#fffbeb] border-none outline-none py-3 px-3 text-[14px] text-[#333] rounded focus:ring-1 focus:ring-[#009688]/40"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#adadad] font-normal">Enter Your Login Password</label>
              <input
                type="password"
                value={password}
                placeholder="Enter login password to verify"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#fffbeb] border-none outline-none py-3 px-3 text-[14px] text-[#333] rounded focus:ring-1 focus:ring-[#009688]/40"
                required
              />
            </div>

            <div className="w-full flex justify-center mt-6">
              <button
                type="submit"
                disabled={launchLoading}
                className="w-full max-w-[600px] bg-[#009688] hover:bg-[#00796b] text-white py-3.5 rounded font-medium text-[16px] border-none cursor-pointer shadow-md transition disabled:opacity-60"
              >
                {launchLoading ? "Launching..." : "Launch"}
              </button>
            </div>
          </form>
        </>
      )}

      <BottomNav />
      <LoadingDialog visible={launchLoading} />
      <ToastStack toasts={toasts} />
    </main>
  );
}
