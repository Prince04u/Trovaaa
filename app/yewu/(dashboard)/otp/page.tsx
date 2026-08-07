"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

type OtpRecord = {
  id: string;
  phone: string;
  code: string;
  sessionId: string | null;
  createdAt: string;
  updatedAt: string;
};

function CountdownTimer({ createdAt }: { createdAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const createdTime = new Date(createdAt).getTime();
      const expiresTime = createdTime + 5 * 60 * 1000;
      const now = Date.now();
      const diff = expiresTime - now;

      if (diff <= 0) {
        setTimeLeft("Expired (5m exceeded)");
        setIsExpired(true);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
      setIsExpired(false);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <span className={isExpired ? "text-red font-medium text-xs bg-red/10 border border-red/20 px-2 py-0.5 rounded-md inline-block whitespace-nowrap" : "text-gold font-mono font-medium text-xs bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-md inline-block whitespace-nowrap"}>
      {timeLeft}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs text-gold border border-gold/30 hover:bg-gold/10 px-2.5 py-1 rounded transition font-semibold shrink-0"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function getOtpDetails(sessionId: string | null) {
  if (!sessionId) {
    return { category: "Register", type: "SMS" };
  }
  if (sessionId === "admin_custom") {
    return { category: "Admin Override", type: "Custom" };
  }
  
  const [sessionVal, actionVal] = sessionId.split(":");
  let category = "Register";
  if (actionVal === "reset_pass") {
    category = "Reset Pass";
  } else if (actionVal === "bank_add") {
    category = "Bank Add";
  }
  
  let type = "SMS";
  if (sessionVal === "mock_session" || sessionVal === "mock_otp") {
    type = "Mock";
  }
  
  return { category, type };
}

export default function AdminOtpPage() {
  const [otps, setOtps] = useState<OtpRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Nickname State
  const [profileName, setProfileName] = useState("");
  const [nicknameInput, setNicknameInput] = useState("");
  const [updatingNickname, setUpdatingNickname] = useState(false);
  const [nicknameSuccessMsg, setNicknameSuccessMsg] = useState("");

  // Tab State
  const [activeTab, setActiveTab] = useState<"actual" | "mock">("actual");

  // Categories partition
  const actualOtps = otps.filter((k) => getOtpDetails(k.sessionId).type === "SMS");
  const mockOtps = otps.filter((k) => {
    const t = getOtpDetails(k.sessionId).type;
    return t === "Mock" || t === "Custom";
  });

  // Independent paginations
  const [currentActualPage, setCurrentActualPage] = useState(1);
  const [currentMockPage, setCurrentMockPage] = useState(1);
  const itemsPerPage = 10;

  const totalActualPages = Math.ceil(actualOtps.length / itemsPerPage);
  const paginatedActualOtps = actualOtps.slice((currentActualPage - 1) * itemsPerPage, currentActualPage * itemsPerPage);

  const totalMockPages = Math.ceil(mockOtps.length / itemsPerPage);
  const paginatedMockOtps = mockOtps.slice((currentMockPage - 1) * itemsPerPage, currentMockPage * itemsPerPage);

  const fetchOtps = async () => {
    try {
      const res = await fetch("/api/yewu/otp");
      const resData = await res.json();
      if (res.ok && resData.success) {
        setOtps(resData.data);
      } else {
        setError(resData.message || "Failed to load OTPs");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load OTPs");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/users/me");
      const resData = await res.json();
      if (res.ok && resData.success) {
        setProfileName(resData.data.name || "");
        setNicknameInput(resData.data.name || "");
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  useEffect(() => {
    fetchOtps();
    fetchProfile();
  }, []);

  const handleSetCustomOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhone || !customCode) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/yewu/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: customPhone, code: customCode }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setCustomPhone("");
        setCustomCode("");
        setCurrentActualPage(1);
        setCurrentMockPage(1);
        fetchOtps();
      } else {
        setError(resData.message || "Failed to set custom OTP");
      }
    } catch (err: any) {
      setError(err.message || "Failed to set custom OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;
    setUpdatingNickname(true);
    setNicknameSuccessMsg("");
    setError("");
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: nicknameInput }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setProfileName(resData.data.displayName);
        setNicknameSuccessMsg("Nickname updated successfully! Please refresh the page to see it in the header.");
        setTimeout(() => setNicknameSuccessMsg(""), 5000);
      } else {
        setError(resData.message || "Failed to update nickname");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update nickname");
    } finally {
      setUpdatingNickname(false);
    }
  };

  // Sync / Reset hooks
  useEffect(() => {
    if (currentActualPage > 1 && currentActualPage > totalActualPages) {
      setCurrentActualPage(Math.max(1, totalActualPages));
    }
  }, [actualOtps.length, totalActualPages, currentActualPage]);

  useEffect(() => {
    if (currentMockPage > 1 && currentMockPage > totalMockPages) {
      setCurrentMockPage(Math.max(1, totalMockPages));
    }
  }, [mockOtps.length, totalMockPages, currentMockPage]);

  return (
    <div className="flex flex-col gap-8 text-foreground font-sans max-w-7xl mx-auto pb-12">
      <h1 className="text-2xl font-semibold">OTP Management & Profile Settings</h1>

      {error && (
        <div className="rounded-xl border border-red/40 bg-red/10 px-4 py-3 text-sm text-red">
          {error}
        </div>
      )}

      {/* Set Custom OTP Card */}
      <section className="card-surface rounded-2xl p-6 bg-surface-1 border border-border">
        <h2 className="font-semibold mb-4 text-gold text-lg">Set Custom / Override OTP</h2>
        <form onSubmit={handleSetCustomOtp} className="flex flex-wrap gap-4 items-end max-w-2xl">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-xs text-muted font-medium">Mobile Number</label>
            <input
              type="text"
              placeholder="e.g. 916204480451"
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
              className="rounded-lg bg-surface border border-border px-3.5 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-gold/60"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-[220px]">
            <label className="text-xs text-muted font-medium">Custom OTP Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 123456"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                className="rounded-lg bg-surface border border-border px-3.5 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-gold/60 flex-1"
                required
              />
              <button
                type="button"
                onClick={() => {
                  const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
                  setCustomCode(randomCode);
                }}
                className="rounded-lg bg-surface-3 hover:bg-surface-4 text-xs font-semibold px-3.5 border border-border transition shrink-0"
              >
                Random
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gold hover:brightness-110 text-black font-semibold text-sm px-5 py-2.5 transition disabled:opacity-50 h-[40px] cursor-pointer"
          >
            {submitting ? "Saving..." : "Save Custom OTP"}
          </button>
        </form>
      </section>

      {/* Tabs Header Selector */}
      <section className="flex flex-col gap-6 mt-4">
        <div className="flex border-b border-border gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("actual")}
            className={`pb-3 font-semibold text-[16px] sm:text-lg border-b-2 transition cursor-pointer ${
              activeTab === "actual"
                ? "border-gold text-gold"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Actual API Verification Codes ({actualOtps.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mock")}
            className={`pb-3 font-semibold text-[16px] sm:text-lg border-b-2 transition cursor-pointer ${
              activeTab === "mock"
                ? "border-gold text-gold"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Mock & Custom Verification Codes ({mockOtps.length})
          </button>
        </div>

        {/* 1. Actual API Verification Codes Tab */}
        {activeTab === "actual" && (
          <div>
            {loading ? (
              <div className="py-8 text-center text-muted text-sm">Loading OTPs...</div>
            ) : actualOtps.length === 0 ? (
              <div className="card-surface rounded-2xl p-8 text-center bg-surface-1 border border-border">
                <p className="text-muted text-sm font-medium">No active actual API verification codes found.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="card-surface rounded-2xl overflow-hidden border border-border bg-surface-1">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border text-left text-sm">
                      <thead className="bg-surface-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                        <tr>
                          <th className="px-6 py-4">Phone Number</th>
                          <th className="px-6 py-4">OTP Code</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Delivery Type</th>
                          <th className="px-6 py-4">Status & Countdown</th>
                          <th className="px-6 py-4">Requested Time</th>
                          <th className="px-6 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {paginatedActualOtps.map((k) => {
                          const { category, type } = getOtpDetails(k.sessionId);
                          return (
                            <tr key={k.id} className="hover:bg-surface-2 transition-colors">
                              <td className="px-6 py-4 font-mono font-bold text-foreground tracking-wide">
                                {k.phone}
                              </td>
                              <td className="px-6 py-4 text-gold font-semibold tracking-wider text-base">
                                {k.code}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                                  category === "Register" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                  category === "Reset Pass" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                                  category === "Bank Add" ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" :
                                  "bg-gold/10 text-gold border border-gold/30"
                                }`}>
                                  {category}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-foreground font-medium">
                                <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                  {type}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <CountdownTimer createdAt={k.createdAt} />
                              </td>
                              <td className="px-6 py-4 text-muted text-xs">
                                {format(new Date(k.createdAt), "d MMM yyyy, h:mm:ss a")}
                              </td>
                              <td className="px-6 py-4">
                                <CopyButton text={k.code} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination Controls */}
                {totalActualPages > 1 && (
                  <div className="flex justify-between items-center mt-2 px-2">
                    <button
                      type="button"
                      onClick={() => setCurrentActualPage((p) => Math.max(p - 1, 1))}
                      disabled={currentActualPage === 1}
                      className="rounded-lg bg-surface border border-border px-4 py-2 text-xs font-semibold hover:bg-surface-3 transition disabled:opacity-50 text-foreground cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-muted">
                      Page {currentActualPage} of {totalActualPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentActualPage((p) => Math.min(p + 1, totalActualPages))}
                      disabled={currentActualPage === totalActualPages}
                      className="rounded-lg bg-surface border border-border px-4 py-2 text-xs font-semibold hover:bg-surface-3 transition disabled:opacity-50 text-foreground cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Mock & Custom Verification Codes Tab */}
        {activeTab === "mock" && (
          <div>
            {loading ? (
              <div className="py-8 text-center text-muted text-sm">Loading OTPs...</div>
            ) : mockOtps.length === 0 ? (
              <div className="card-surface rounded-2xl p-8 text-center bg-surface-1 border border-border">
                <p className="text-muted text-sm font-medium">No active mock or custom verification codes found.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="card-surface rounded-2xl overflow-hidden border border-border bg-surface-1">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border text-left text-sm">
                      <thead className="bg-surface-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                        <tr>
                          <th className="px-6 py-4">Phone Number</th>
                          <th className="px-6 py-4">OTP Code</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Delivery Type</th>
                          <th className="px-6 py-4">Status & Countdown</th>
                          <th className="px-6 py-4">Requested Time</th>
                          <th className="px-6 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {paginatedMockOtps.map((k) => {
                          const { category, type } = getOtpDetails(k.sessionId);
                          return (
                            <tr key={k.id} className="hover:bg-surface-2 transition-colors">
                              <td className="px-6 py-4 font-mono font-bold text-foreground tracking-wide">
                                {k.phone}
                              </td>
                              <td className="px-6 py-4 text-gold font-semibold tracking-wider text-base">
                                {k.code}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                                  category === "Register" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                  category === "Reset Pass" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                                  category === "Bank Add" ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" :
                                  "bg-gold/10 text-gold border border-gold/30"
                                }`}>
                                  {category}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-foreground font-medium">
                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                                  type === "Mock" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                                  "bg-gold/10 text-gold border border-gold/20"
                                }`}>
                                  {type}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <CountdownTimer createdAt={k.createdAt} />
                              </td>
                              <td className="px-6 py-4 text-muted text-xs">
                                {format(new Date(k.createdAt), "d MMM yyyy, h:mm:ss a")}
                              </td>
                              <td className="px-6 py-4">
                                <CopyButton text={k.code} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination Controls */}
                {totalMockPages > 1 && (
                  <div className="flex justify-between items-center mt-2 px-2">
                    <button
                      type="button"
                      onClick={() => setCurrentMockPage((p) => Math.max(p - 1, 1))}
                      disabled={currentMockPage === 1}
                      className="rounded-lg bg-surface border border-border px-4 py-2 text-xs font-semibold hover:bg-surface-3 transition disabled:opacity-50 text-foreground cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-muted">
                      Page {currentMockPage} of {totalMockPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentMockPage((p) => Math.min(p + 1, totalMockPages))}
                      disabled={currentMockPage === totalMockPages}
                      className="rounded-lg bg-surface border border-border px-4 py-2 text-xs font-semibold hover:bg-surface-3 transition disabled:opacity-50 text-foreground cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
