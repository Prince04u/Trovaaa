"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

type Creator = {
  id: string;
  displayName: string;
  phone: string;
};

type Claim = {
  id: string;
  amount: number;
  claimedAt: string;
  user: {
    id: string;
    displayName: string;
    phone: string;
  };
};

type RedEnvelope = {
  id: string;
  code: string;
  amount: number;
  maxClaims: number;
  claimedCount: number;
  specificUserId: string | null;
  createdAt: string;
  creator: Creator | null;
  claims: Claim[];
};

type PermittedUser = {
  id: string;
  uid: number;
  displayName: string;
  phone: string;
  createdAt: string;
};

export default function AdminRedEnvelopePage() {
  const [envelopes, setEnvelopes] = useState<RedEnvelope[]>([]);
  const [permittedUsers, setPermittedUsers] = useState<PermittedUser[]>([]);
  const [loadingEnvelopes, setLoadingEnvelopes] = useState(true);
  const [loadingPermitted, setLoadingPermitted] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Create Form State
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [maxClaims, setMaxClaims] = useState("");
  const [specificUserPhone, setSpecificUserPhone] = useState("");
  const [creating, setCreating] = useState(false);

  // Permission Form State
  const [permissionPhone, setPermissionPhone] = useState("");
  const [granting, setGranting] = useState(false);

  // Claims Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedClaims, setSearchedClaims] = useState<any[]>([]);
  const [searchingClaims, setSearchingClaims] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Helper: Generate Random Code
  const generateRandomCode = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  useEffect(() => {
    generateRandomCode();
    fetchEnvelopes();
    fetchPermittedUsers();
  }, []);

  const fetchEnvelopes = async () => {
    setLoadingEnvelopes(true);
    try {
      const res = await fetch("/api/yewu/red-envelope");
      const data = await res.json();
      if (res.ok && data.success) {
        setEnvelopes(data.data);
      } else {
        setError(data.message || "Failed to load envelopes");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load envelopes");
    } finally {
      setLoadingEnvelopes(false);
    }
  };

  const fetchPermittedUsers = async () => {
    setLoadingPermitted(true);
    try {
      const res = await fetch("/api/yewu/red-envelope/permission");
      const data = await res.json();
      if (res.ok && data.success) {
        setPermittedUsers(data.data);
      }
    } catch (err: any) {
      console.error("Failed to load permitted users", err);
    } finally {
      setLoadingPermitted(false);
    }
  };

  const handleCreateEnvelope = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !amount || !maxClaims) return;
    setError("");
    setSuccessMsg("");
    setCreating(true);
    try {
      const res = await fetch("/api/yewu/red-envelope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          amount: parseFloat(amount),
          maxClaims: parseInt(maxClaims),
          specificUserPhone: specificUserPhone.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Red Envelope created! Code: ${code}`);
        setAmount("");
        setMaxClaims("");
        setSpecificUserPhone("");
        generateRandomCode();
        fetchEnvelopes();
      } else {
        setError(data.message || "Failed to create envelope");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create envelope");
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePermission = async (phone: string, canCreate: boolean) => {
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/yewu/red-envelope/permission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, canCreate }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Permissions updated for ${phone}`);
        setPermissionPhone("");
        fetchPermittedUsers();
      } else {
        setError(data.message || "Failed to update permissions");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update permissions");
    }
  };

  const handleSearchClaims = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setError("");
    setSearchingClaims(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/yewu/red-envelope/claims?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSearchedClaims(data.data);
      } else {
        setError(data.message || "Failed to fetch claims");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch claims");
    } finally {
      setSearchingClaims(false);
    }
  };

  const getShareableUrl = (envelopeCode: string) => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      return `${origin}/redenvelopes?code=${envelopeCode}`;
    }
    return `/redenvelopes?code=${envelopeCode}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="flex flex-col gap-8 text-foreground font-sans max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-semibold">Red Envelope Management</h1>
        <p className="text-sm text-muted mt-1">Generate red envelopes, manage user creation permissions, and monitor claims history.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red/40 bg-red/10 px-4 py-3 text-sm text-red">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-4 py-3 text-sm text-teal-400">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Red Envelope Panel */}
        <section className="card-surface rounded-2xl p-6 bg-surface-1 border border-border flex flex-col gap-4">
          <h2 className="font-semibold text-gold text-lg">Create Red Envelope</h2>
          <form onSubmit={handleCreateEnvelope} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted font-medium">Red Envelope Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 29ded5e1"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="rounded-lg bg-surface border border-border px-3.5 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-gold/60 flex-1"
                  required
                />
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="rounded-lg bg-surface-3 hover:bg-surface-4 text-xs font-semibold px-4 border border-border transition"
                >
                  Regenerate
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted font-medium">Claim Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 20"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded-lg bg-surface border border-border px-3.5 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-gold/60"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted font-medium">Max Unique Claims</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={maxClaims}
                  onChange={(e) => setMaxClaims(e.target.value)}
                  className="rounded-lg bg-surface border border-border px-3.5 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-gold/60"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted font-medium">Restrict to User Phone (Optional)</label>
              <input
                type="text"
                placeholder="Leave blank for anyone to claim"
                value={specificUserPhone}
                onChange={(e) => setSpecificUserPhone(e.target.value)}
                className="rounded-lg bg-surface border border-border px-3.5 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-gold/60"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-gold hover:brightness-110 text-black font-semibold text-sm px-5 py-2.5 transition disabled:opacity-50 mt-2"
            >
              {creating ? "Creating..." : "Create Envelope"}
            </button>
          </form>
        </section>

        {/* User Creation Permissions Panel */}
        <section className="card-surface rounded-2xl p-6 bg-surface-1 border border-border flex flex-col gap-4">
          <h2 className="font-semibold text-gold text-lg">Grant Creation Permission</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (permissionPhone) handleTogglePermission(permissionPhone.trim(), true);
            }}
            className="flex gap-2 items-end"
          >
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs text-muted font-medium">User Mobile Number</label>
              <input
                type="text"
                placeholder="e.g. +919341225312"
                value={permissionPhone}
                onChange={(e) => setPermissionPhone(e.target.value)}
                className="rounded-lg bg-surface border border-border px-3.5 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-gold/60"
                required
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm px-5 py-2.5 transition h-[38px] flex items-center justify-center shrink-0"
            >
              Grant
            </button>
          </form>

          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mt-4">Authorized Users</h3>
          <div className="max-h-[180px] overflow-y-auto border border-border rounded-lg bg-surface divide-y divide-border">
            {loadingPermitted ? (
              <div className="p-4 text-center text-xs text-muted">Loading...</div>
            ) : permittedUsers.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted">No users currently authorized.</div>
            ) : (
              permittedUsers.map((u) => (
                <div key={u.id} className="flex justify-between items-center p-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{u.displayName}</p>
                    <p className="text-xs text-muted font-mono">{u.phone}</p>
                  </div>
                  <button
                    onClick={() => handleTogglePermission(u.phone, false)}
                    className="text-xs text-red hover:underline"
                  >
                    Revoke
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Claims Search Section */}
      <section className="card-surface rounded-2xl p-6 bg-surface-1 border border-border flex flex-col gap-4">
        <h2 className="font-semibold text-gold text-lg">Search Claims by User</h2>
        <form onSubmit={handleSearchClaims} className="flex gap-2 items-end max-w-md">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs text-muted font-medium">User ID or Phone Number</label>
            <input
              type="text"
              placeholder="e.g. +919341225312"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg bg-surface border border-border px-3.5 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-gold/60"
              required
            />
          </div>
          <button
            type="submit"
            disabled={searchingClaims}
            className="rounded-lg bg-surface-3 hover:bg-surface-4 text-foreground border border-border font-semibold text-sm px-5 py-2.5 transition h-[38px] flex items-center justify-center shrink-0"
          >
            {searchingClaims ? "Searching..." : "Search"}
          </button>
        </form>

        {hasSearched && (
          <div className="border border-border rounded-xl overflow-hidden bg-surface mt-2">
            <table className="min-w-full divide-y divide-border text-left text-xs">
              <thead className="bg-surface-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Envelope Code</th>
                  <th className="px-6 py-3.5">Claimed Amount</th>
                  <th className="px-6 py-3.5">Claimed Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {searchedClaims.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted">
                      No claims found for this search.
                    </td>
                  </tr>
                ) : (
                  searchedClaims.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-2/40 transition">
                      <td className="px-6 py-3 font-medium">
                        {c.user?.displayName || "Unknown"} ({c.user?.phone})
                      </td>
                      <td className="px-6 py-3 font-mono font-semibold text-gold">{c.redEnvelope?.code}</td>
                      <td className="px-6 py-3 font-bold text-foreground text-sm">₹{c.amount}</td>
                      <td className="px-6 py-3 text-muted">
                        {format(new Date(c.claimedAt), "d MMM yyyy, h:mm a")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Generated Envelopes List */}
      <section className="flex flex-col gap-6">
        <h2 className="font-semibold text-lg">Active Red Envelopes ({envelopes.length})</h2>
        {loadingEnvelopes ? (
          <div className="py-8 text-center text-muted text-sm">Loading Envelopes...</div>
        ) : envelopes.length === 0 ? (
          <div className="card-surface rounded-2xl p-8 text-center bg-surface-1 border border-border">
            <p className="text-muted text-sm font-medium">No red envelopes created yet.</p>
          </div>
        ) : (
          <div className="card-surface rounded-2xl overflow-hidden border border-border bg-surface-1">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-left text-sm">
                <thead className="bg-surface-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-6 py-4">Envelope Code</th>
                    <th className="px-6 py-4">Value per Claim</th>
                    <th className="px-6 py-4">Claims Status</th>
                    <th className="px-6 py-4">Recipient Restriction</th>
                    <th className="px-6 py-4">Created By</th>
                    <th className="px-6 py-4">Date Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {envelopes.map((env) => (
                    <tr key={env.id} className="hover:bg-surface-2 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gold tracking-wide text-sm">
                        {env.code}
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground text-sm">
                        ₹{env.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        <span className="font-mono font-semibold">{env.claimedCount}</span> /{" "}
                        <span className="font-mono text-muted">{env.maxClaims}</span>
                      </td>
                      <td className="px-6 py-4">
                        {env.specificUserId ? (
                          <span className="text-rose-400 font-medium">Single User Restricted</span>
                        ) : (
                          <span className="text-teal-400 font-medium">Public (Any User)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted">
                        {env.creator?.displayName || "Admin"}
                      </td>
                      <td className="px-6 py-4 text-muted">
                        {format(new Date(env.createdAt), "d MMM yyyy, h:mm a")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => copyToClipboard(getShareableUrl(env.code))}
                          className="rounded bg-teal-500/10 text-teal-400 border border-teal-500/30 px-3 py-1 font-semibold hover:bg-teal-500/20 transition mr-2"
                        >
                          Copy Link
                        </button>
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
