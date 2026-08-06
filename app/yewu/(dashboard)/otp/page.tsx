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

export default function AdminOtpPage() {
  const [otps, setOtps] = useState<OtpRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    fetchOtps();
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

  return (
    <div className="flex flex-col gap-8 text-foreground font-sans">
      <h1 className="text-2xl font-semibold">OTP Management (Operations)</h1>

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
          <div className="flex flex-col gap-1.5 w-[140px]">
            <label className="text-xs text-muted font-medium">Custom OTP Code</label>
            <input
              type="text"
              placeholder="e.g. 123456"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="rounded-lg bg-surface border border-border px-3.5 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-gold/60"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gold hover:brightness-110 text-black font-semibold text-sm px-5 py-2.5 transition disabled:opacity-50 h-[40px]"
          >
            {submitting ? "Saving..." : "Save Custom OTP"}
          </button>
        </form>
      </section>

      {/* Active OTP List */}
      <section className="flex flex-col gap-6">
        <h2 className="font-semibold text-lg">Active Verification Codes ({otps.length})</h2>
        {loading ? (
          <div className="py-8 text-center text-muted text-sm">Loading OTPs...</div>
        ) : otps.length === 0 ? (
          <div className="card-surface rounded-2xl p-8 text-center bg-surface-1 border border-border">
            <p className="text-muted text-sm font-medium">No active OTP verification codes found.</p>
          </div>
        ) : (
          <div className="card-surface rounded-2xl overflow-hidden border border-border bg-surface-1">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-left text-sm">
                <thead className="bg-surface-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-6 py-4">Phone Number</th>
                    <th className="px-6 py-4">OTP Code</th>
                    <th className="px-6 py-4">Session Type</th>
                    <th className="px-6 py-4">Requested Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {otps.map((k) => (
                    <tr key={k.id} className="hover:bg-surface-2 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-foreground tracking-wide">
                        {k.phone}
                      </td>
                      <td className="px-6 py-4 text-gold font-semibold tracking-wider text-base">
                        {k.code}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {k.sessionId === "admin_custom" ? (
                          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-gold/10 text-gold border border-gold/30">
                            Custom Override
                          </span>
                        ) : k.sessionId === "mock_session" ? (
                          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-surface text-muted border border-border">
                            Dev Mockup
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-green/10 text-green border border-green/30">
                            HyperAPI SMS
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted text-xs">
                        {format(new Date(k.createdAt), "d MMM yyyy, h:mm:ss a")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
