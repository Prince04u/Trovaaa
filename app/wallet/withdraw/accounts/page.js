"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { getToken } from "@/lib/auth";
import {
  addBankAccount,
  addUpiAccount,
  addUsdtAccount,
  fetchWithdrawAccountsState,
  removeWithdrawAccount,
  setWithdrawMethod,
  selectWithdrawAccount,
} from "@/lib/withdrawAccounts";
import { maskAccountNumber } from "@/lib/withdrawRules";
import DepositIcon from "@/components/wallet/DepositIcon";
import PageLoader from "@/components/brand/PageLoader";

const ACCOUNT_METHODS = [
  { id: "bank", label: "Bank card", icon: "bank" },
  { id: "usdt", label: "USDT", icon: "usdt" },
];

const maskUsdtAddress = (value = "") => {
  const trimmed = String(value).trim();
  if (trimmed.length <= 12) return trimmed;
  return `${trimmed.slice(0, 8)}...${trimmed.slice(-6)}`;
};

function WithdrawAccountsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return") || "/wallet/withdraw";
  const initialMethod = searchParams.get("method");

  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [method, setMethod] = useState("bank");
  const [accounts, setAccounts] = useState({ bank: [], upi: [], usdt: [] });
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [usdtAddress, setUsdtAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const refreshAccounts = useCallback(async () => {
    const state = await fetchWithdrawAccountsState();
    setAccounts({
      bank: state.bank || [],
      upi: state.upi || [],
      usdt: state.usdt || [],
    });
    return state;
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    const load = async () => {
      setLoadingAccounts(true);
      try {
        const state = await refreshAccounts();
        const nextMethod =
          initialMethod === "bank" || initialMethod === "usdt"
            ? initialMethod
            : (state.method === "upi" ? "bank" : (state.method || "bank"));
        setMethod(nextMethod);
      } catch (err) {
        if (err.response?.status === 401) {
          router.replace("/login");
          return;
        }
        setError(err.response?.data?.message || "Failed to load saved accounts");
      } finally {
        setLoadingAccounts(false);
      }
    };

    load();
  }, [router, initialMethod, refreshAccounts]);

  const currentList = useMemo(() => accounts[method] || [], [accounts, method]);

  const hasAnyAccount = useMemo(() => {
    return (accounts.bank?.length || 0) > 0 || (accounts.upi?.length || 0) > 0 || (accounts.usdt?.length || 0) > 0;
  }, [accounts]);

  const backHref = useMemo(() => {
    if (loadingAccounts) return returnTo;
    return hasAnyAccount ? returnTo : "/wallet";
  }, [loadingAccounts, hasAnyAccount, returnTo]);

  const selectTab = async (nextMethod) => {
    setMethod(nextMethod);
    setError("");
    setSuccess("");
    setShowAddForm(false);
    setAccountName("");
    setAccountNumber("");
    setIfsc("");
    setUpiId("");
    setUsdtAddress("");
    setBankName("");
    try {
      await setWithdrawMethod(nextMethod);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update tab");
    }
  };

  const handleSelect = async (accountId) => {
    try {
      setError("");
      setSuccess("");
      await selectWithdrawAccount(method, accountId);
      await refreshAccounts();
      setSuccess("Preferred account updated");
    } catch (err) {
      setError(err.message || "Failed to select account");
    }
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const wasEmpty = currentList.length === 0;

      if (method === "bank") {
        await addBankAccount({ accountName, accountNumber, ifsc, bankName });
        setAccountName("");
        setAccountNumber("");
        setIfsc("");
        setBankName("");
        setSuccess("Bank account saved");
      } else if (method === "upi") {
        await addUpiAccount({ upiId, accountName });
        setUpiId("");
        setAccountName("");
        setSuccess("UPI ID saved");
      } else {
        await addUsdtAccount({ address: usdtAddress });
        setUsdtAddress("");
        setSuccess("USDT address saved");
      }

      await refreshAccounts();
      setShowAddForm(false);

      if (wasEmpty && returnTo.startsWith("/wallet/withdraw")) {
        router.replace(returnTo);
      }
    } catch (err) {
      setError(err.message || "Could not save account");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (accountId) => {
    setError("");
    setSuccess("");
    try {
      await removeWithdrawAccount(method, accountId);
      await refreshAccounts();
    } catch (err) {
      setError(err.message || "Could not remove account");
    }
  };

  if (loadingAccounts) {
    return <PageLoader />;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#fafafa", color: "#222222", paddingBottom: "100px", position: "relative" }}>
      {/* HEADER */}
      <header style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        marginBottom: "1.5rem",
        background: "#009688",
        margin: "0 0 1.5rem 0",
        padding: "0.75rem 1rem",
        color: "#ffffff"
      }}>
        <Link href={backHref} style={{ color: "#ffffff", textDecoration: "none", fontSize: "2rem", padding: "0 0.5rem" }} aria-label="Back">
          ‹
        </Link>
        <h1 style={{ fontSize: "1.125rem", fontWeight: "600", margin: 0 }}>Withdraw accounts</h1>
        <span style={{ width: "32px" }} />
      </header>

      <section className="withdraw-section" style={{ padding: "0 1rem" }}>
        <p className="withdraw-accounts-intro" style={{ color: "#666666", fontSize: "13px", marginBottom: "16px", lineHeight: "1.5" }}>
          Add bank, UPI, or USDT details here. On the withdraw page you can only select saved accounts.
        </p>

        <div className="withdraw-method-tabs withdraw-accounts-tabs" style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
          {ACCOUNT_METHODS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`withdraw-method-tab ${method === item.id ? "active" : ""}`}
              onClick={() => selectTab(item.id)}
              style={{
                background: method === item.id ? "#009688" : "#ffffff",
                color: method === item.id ? "#ffffff" : "#4e4e4e",
                border: method === item.id ? "none" : "1px solid #eaeaea",
                borderRadius: "8px",
                padding: "0.625rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
                flex: 1,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "0.8rem",
                transition: "all 0.2s"
              }}
            >
              {item.icon === "usdt" ? (
                <DepositIcon id="usdt" size={22} className="withdraw-method-tab-icon" />
              ) : item.icon === "upi" ? (
                <DepositIcon id="upi-badge" size={22} className="withdraw-method-tab-icon" />
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" className="withdraw-method-tab-icon" style={{ display: "inline-block", verticalAlign: "middle" }}>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="7" y1="15" x2="11" y2="15" />
                </svg>
              )}
              <strong>{item.label.toUpperCase()}</strong>
            </button>
          ))}
        </div>
      </section>

      {currentList.length > 0 ? (
        <section className="withdraw-section" style={{ padding: "0 1rem", marginBottom: "1rem" }}>
          <p className="withdraw-step-label" style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "8px", color: "#666666" }}>Saved accounts</p>
          <div className="withdraw-accounts-list">
            {currentList.map((item) => (
              <div key={item.id} className="withdraw-linked-account withdraw-account-item" style={{
                display: "flex",
                alignItems: "center",
                background: "#ffffff",
                border: "1px solid #eaeaea",
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "8px",
                color: "#222222"
              }}>
                {method === "bank" ? (
                  <>
                    <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" strokeWidth="2" fill="none" className="withdraw-linked-account-icon-svg" style={{ color: "#009688", marginRight: "12px", flexShrink: 0 }}>
                      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
                    </svg>
                    <div className="withdraw-linked-account-copy" style={{ display: "flex", flexDirection: "column" }}>
                      <strong style={{ fontSize: "14px" }}>{item.accountName}</strong>
                      <small style={{ color: "#666666", fontSize: "12px" }}>{maskAccountNumber(item.accountNumber)} · {item.ifsc}</small>
                    </div>
                  </>
                ) : null}
                {method === "upi" ? (
                  <>
                    <DepositIcon id="upi-badge" size={26} className="withdraw-linked-account-icon-img" style={{ marginRight: "12px" }} />
                    <div className="withdraw-linked-account-copy" style={{ display: "flex", flexDirection: "column" }}>
                      <strong style={{ fontSize: "14px" }}>UPI</strong>
                      <small style={{ color: "#666666", fontSize: "12px" }}>{item.upiId}</small>
                    </div>
                  </>
                ) : null}
                {method === "usdt" ? (
                  <>
                    <DepositIcon id="usdt" size={22} className="withdraw-linked-account-icon-img" style={{ marginRight: "12px" }} />
                    <div className="withdraw-linked-account-copy" style={{ display: "flex", flexDirection: "column" }}>
                      <strong style={{ fontSize: "14px" }}>USDT TRC20</strong>
                      <small style={{ color: "#666666", fontSize: "12px" }}>{maskUsdtAddress(item.address)}</small>
                    </div>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Saved Accounts list matching the reference image layout */}
      <section className="withdraw-section" style={{ padding: "0 1rem" }}>
        {currentList.length > 0 ? (
          <div className="withdraw-accounts-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {currentList.map((item) => {
              const isSelected = item.isPreferred;
              return (
                <div
                  key={item.id}
                  onClick={() => !isSelected && handleSelect(item.id)}
                  style={{
                    background: "#ffffff",
                    border: isSelected ? "1.5px solid #009688" : "1.5px solid #eaeaea",
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: isSelected ? "default" : "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                  }}
                >
                  {/* Top color banner */}
                  <div style={{
                    height: "12px",
                    background: isSelected 
                      ? "linear-gradient(90deg, #009688, #00796b)" 
                      : "linear-gradient(90deg, #eaeaea, #dddddd)"
                  }} />

                  {/* Card Content */}
                  <div style={{ padding: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {method === "bank" && (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eaeaea", paddingBottom: "8px" }}>
                            <span style={{ color: "#666666", fontSize: "13px" }}>Bank name</span>
                            <span style={{ color: "#222222", fontWeight: "600", fontSize: "14px", marginLeft: "auto" }}>{item.bankName || "Bank Card"}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eaeaea", paddingBottom: "8px" }}>
                            <span style={{ color: "#666666", fontSize: "13px" }}>Bank account number</span>
                            <span style={{ color: "#222222", fontWeight: "600", fontSize: "14px", marginLeft: "auto", fontFamily: "monospace" }}>{maskAccountNumber(item.bankCardNumber)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eaeaea", paddingBottom: "8px" }}>
                            <span style={{ color: "#666666", fontSize: "13px" }}>Account holder name</span>
                            <span style={{ color: "#222222", fontWeight: "600", fontSize: "14px", marginLeft: "auto" }}>{item.bankCardHolder}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "4px" }}>
                            <span style={{ color: "#666666", fontSize: "13px" }}>IFSC Code</span>
                            <span style={{ color: "#222222", fontWeight: "600", fontSize: "14px", marginLeft: "auto", fontFamily: "monospace" }}>{item.ifsc}</span>
                          </div>
                        </>
                      )}

                      {method === "upi" && (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eaeaea", paddingBottom: "8px" }}>
                            <span style={{ color: "#666666", fontSize: "13px" }}>Account type</span>
                            <span style={{ color: "#222222", fontWeight: "600", fontSize: "14px", marginLeft: "auto" }}>UPI</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "4px" }}>
                            <span style={{ color: "#666666", fontSize: "13px" }}>UPI ID</span>
                            <span style={{ color: "#222222", fontWeight: "600", fontSize: "14px", marginLeft: "auto", fontFamily: "monospace" }}>{item.upiId}</span>
                          </div>
                        </>
                      )}

                      {method === "usdt" && (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eaeaea", paddingBottom: "8px" }}>
                            <span style={{ color: "#666666", fontSize: "13px" }}>Network</span>
                            <span style={{ color: "#222222", fontWeight: "600", fontSize: "14px", marginLeft: "auto" }}>USDT TRC20</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "4px" }}>
                            <span style={{ color: "#666666", fontSize: "13px" }}>Wallet Address</span>
                            <span style={{ color: "#222222", fontWeight: "600", fontSize: "14px", marginLeft: "auto", fontFamily: "monospace" }}>{maskUsdtAddress(item.cryptoAddress || item.address)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Status circle footer */}
                    <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        border: isSelected ? "none" : "2px solid #eaeaea",
                        background: isSelected ? "#009688" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: "bold"
                      }}>
                        {isSelected ? "✓" : ""}
                      </span>
                      <span style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: isSelected ? "#009688" : "#8a8b94"
                      }}>
                        {isSelected ? "Current Payment" : "Select"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted text-center py-6" style={{ color: "#666666", textAlign: "center", padding: "1.5rem 0" }}>No saved accounts found for this method.</p>
        )}
      </section>

      {/* Conditional Add Payment Form or Dashboard trigger */}
      {!showAddForm ? (
        <section className="withdraw-section" style={{ padding: "0 1rem" }}>
          <div
            onClick={() => { setShowAddForm(true); setError(""); setSuccess(""); }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
              border: "1.5px dashed rgba(0, 150, 136, 0.3)",
              borderRadius: "12px",
              padding: "24px",
              cursor: "pointer",
              textAlign: "center",
              marginTop: "20px"
            }}
          >
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "6px",
              border: "1px dashed rgba(0, 150, 136, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              color: "#009688",
              marginBottom: "8px"
            }}>+</div>
            <p style={{ color: "#009688", fontWeight: "600", fontSize: "14px" }}>
              {method === "bank" ? "Add a bank account number" : method === "upi" ? "Add UPI account" : "Add USDT TRC20 address"}
            </p>
          </div>
        </section>
      ) : (
        <section className="withdraw-section" style={{ padding: "0 1rem" }}>
          <p className="withdraw-step-label" style={{ marginTop: "20px", fontSize: "14px", fontWeight: "bold", color: "#666666" }}>Link payment method</p>
          <form className="withdraw-account-form" onSubmit={handleAdd} style={{
            background: "#ffffff",
            border: "1px solid #eaeaea",
            borderRadius: "12px",
            padding: "16px",
            marginTop: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}>
            {method === "bank" ? (
              <div className="withdraw-bank-fields">
                <input
                  type="text"
                  placeholder="Bank Name (e.g. HDFC Bank)"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="withdraw-input"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#ffffff",
                    border: "1px solid #cccccc",
                    color: "#222222",
                    marginBottom: "12px",
                    outline: "none"
                  }}
                  required
                />
                <input
                  type="text"
                  placeholder="Account holder name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="withdraw-input"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#ffffff",
                    border: "1px solid #cccccc",
                    color: "#222222",
                    marginBottom: "12px",
                    outline: "none"
                  }}
                  required
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="withdraw-input"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#ffffff",
                    border: "1px solid #cccccc",
                    color: "#222222",
                    marginBottom: "12px",
                    outline: "none"
                  }}
                  autoComplete="off"
                  required
                />
                <input
                  type="text"
                  placeholder="IFSC code"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  maxLength={11}
                  className="withdraw-input"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#ffffff",
                    border: "1px solid #cccccc",
                    color: "#222222",
                    marginBottom: "12px",
                    outline: "none"
                  }}
                  autoComplete="off"
                  required
                />
              </div>
            ) : null}

            {method === "upi" ? (
              <div className="withdraw-upi-fields">
                <input
                  type="text"
                  placeholder="Full Name (Account holder name)"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="withdraw-input"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#ffffff",
                    border: "1px solid #cccccc",
                    color: "#222222",
                    marginBottom: "12px",
                    outline: "none"
                  }}
                  required
                />
                <div className="withdraw-input-wrap" style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
                  <span className="withdraw-input-icon" style={{ color: "#666666" }}>@</span>
                  <input
                    type="text"
                    placeholder="UPI ID (e.g. name@bank)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="withdraw-input"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      background: "#ffffff",
                      border: "1px solid #cccccc",
                      color: "#222222",
                      outline: "none"
                    }}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
            ) : null}

            {method === "usdt" ? (
              <div className="withdraw-usdt-panel">
                <p className="withdraw-usdt-help" style={{ fontSize: "12px", color: "#009688", marginBottom: "8px" }}>
                  Use a TRC20 wallet address only. Wrong network may cause permanent loss.
                </p>
                <input
                  type="text"
                  placeholder="USDT TRC20 wallet address"
                  value={usdtAddress}
                  onChange={(e) => setUsdtAddress(e.target.value)}
                  className="withdraw-input"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#ffffff",
                    border: "1px solid #cccccc",
                    color: "#222222",
                    marginBottom: "12px",
                    outline: "none"
                  }}
                  autoComplete="off"
                  required
                />
              </div>
            ) : null}

            {error ? <div className="auth-error withdraw-accounts-error" style={{ color: "#ef4444", fontSize: "13px", marginBottom: "12px" }}>{error}</div> : null}
            {success ? <div className="withdraw-accounts-success" style={{ color: "#22c55e", fontSize: "13px", marginBottom: "12px" }}>{success}</div> : null}

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button type="submit" className="withdraw-accounts-save" disabled={saving} style={{
                flex: 1,
                padding: "12px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #009688, #00796b)",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "14px",
                cursor: "pointer",
                border: "none",
                transition: "all 0.2s"
              }}>
                {saving ? "Saving..." : "Save details"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: "12px 20px",
                  borderRadius: "8px",
                  background: "#eaeaea",
                  color: "#666666",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                  border: "none"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Standard warning notice block */}
      <section className="withdraw-section" style={{ padding: "0 1rem" }}>
        <div style={{
          background: "#ffffff",
          border: "1px solid #eaeaea",
          borderRadius: "12px",
          padding: "16px",
          textAlign: "center",
          marginTop: "20px"
        }}>
          <p style={{ color: "#666666", fontSize: "12px", lineHeight: "1.6", margin: "0 0 10px 0" }}>
            To modify, delete, or correct any saved account details, please contact customer support.
          </p>
          <Link href="/support" style={{
            color: "#009688",
            fontWeight: "600",
            fontSize: "13px",
            textDecoration: "underline"
          }}>
            Contact Customer Support
          </Link>
        </div>
      </section>

      <section className="withdraw-section withdraw-accounts-footer-link" style={{ padding: "0 1rem", textAlign: "center", marginTop: "1.5rem" }}>
        <Link href={backHref} className="withdraw-usdt-support-link" style={{ color: "#009688", fontSize: "14px", textDecoration: "none" }}>
          Back to withdraw
        </Link>
      </section>
    </main>
  );
}

export default function WithdrawAccountsPage() {
  return (
    <Suspense
      fallback={<PageLoader />}
    >
      <WithdrawAccountsContent />
    </Suspense>
  );
}
