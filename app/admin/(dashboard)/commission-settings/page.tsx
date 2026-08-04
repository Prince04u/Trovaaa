"use client";

import { useState, useEffect } from "react";
import { getSetting, saveSetting } from "@/lib/actions/settings";
import { Save, Loader2, AlertCircle } from "lucide-react";

export default function CommissionSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [rechargeBonus, setRechargeBonus] = useState({
    firstRechargeMemberBonus: "",
    firstRechargeAgentBonus: "",
    secondRechargeMemberBonus: "",
    secondRechargeAgentBonus: "",
    thirdRechargeMemberBonus: "",
    thirdRechargeAgentBonus: "",
  });

  const [bettingCommission, setBettingCommission] = useState({
    level1: "",
    level2: "",
    level3: "",
    level4: "",
    level5: "",
    level6: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const rechargeStr = await getSetting("recharge_bonus_settings");
        if (rechargeStr && rechargeStr !== "{}") {
          setRechargeBonus(JSON.parse(rechargeStr));
        }

        const commissionStr = await getSetting("betting_commission_settings");
        if (commissionStr && commissionStr !== "{}") {
          setBettingCommission(JSON.parse(commissionStr));
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res1 = await saveSetting("recharge_bonus_settings", JSON.stringify(rechargeBonus));
      const res2 = await saveSetting("betting_commission_settings", JSON.stringify(bettingCommission));

      if (res1.success && res2.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res1.error || res2.error || "Failed to save settings");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const updateRecharge = (field: keyof typeof rechargeBonus, value: string) => {
    setRechargeBonus(prev => ({ ...prev, [field]: value }));
  };

  const updateCommission = (field: keyof typeof bettingCommission, value: string) => {
    setBettingCommission(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-8 w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-zinc-400 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Commission & Bonus Settings</h1>
          <p className="text-muted text-sm mt-1">Configure global recharge bonuses and multi-level betting commissions.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md font-medium transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-md flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
            <span className="material-icons-outlined text-sm">check</span>
          </div>
          <p className="text-sm font-medium">Settings saved successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recharge Bonuses Card */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border/50 bg-surface-2/30">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="material-icons-outlined text-indigo-500">card_giftcard</span>
              Recharge Bonuses
            </h2>
            <p className="text-xs text-muted mt-1">Set the flat amount (₹) or percentage (%) bonus for members and agents.</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* First Recharge */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">1st Recharge</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Member Bonus (₹ or %)</label>
                  <input
                    type="text"
                    value={rechargeBonus.firstRechargeMemberBonus}
                    onChange={(e) => updateRecharge("firstRechargeMemberBonus", e.target.value)}
                    placeholder="e.g. 50 or 5%"
                    className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Agent Bonus (₹ or %)</label>
                  <input
                    type="text"
                    value={rechargeBonus.firstRechargeAgentBonus}
                    onChange={(e) => updateRecharge("firstRechargeAgentBonus", e.target.value)}
                    placeholder="e.g. 100 or 10%"
                    className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-border/50 w-full" />

            {/* Second Recharge */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">2nd Recharge</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Member Bonus (₹ or %)</label>
                  <input
                    type="text"
                    value={rechargeBonus.secondRechargeMemberBonus}
                    onChange={(e) => updateRecharge("secondRechargeMemberBonus", e.target.value)}
                    placeholder="e.g. 50 or 5%"
                    className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Agent Bonus (₹ or %)</label>
                  <input
                    type="text"
                    value={rechargeBonus.secondRechargeAgentBonus}
                    onChange={(e) => updateRecharge("secondRechargeAgentBonus", e.target.value)}
                    placeholder="e.g. 100 or 10%"
                    className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-border/50 w-full" />

            {/* Third Recharge */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">3rd Recharge</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Member Bonus (₹ or %)</label>
                  <input
                    type="text"
                    value={rechargeBonus.thirdRechargeMemberBonus}
                    onChange={(e) => updateRecharge("thirdRechargeMemberBonus", e.target.value)}
                    placeholder="e.g. 50 or 5%"
                    className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Agent Bonus (₹ or %)</label>
                  <input
                    type="text"
                    value={rechargeBonus.thirdRechargeAgentBonus}
                    onChange={(e) => updateRecharge("thirdRechargeAgentBonus", e.target.value)}
                    placeholder="e.g. 100 or 10%"
                    className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Level Betting Commission Card */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm h-fit">
          <div className="p-5 border-b border-border/50 bg-surface-2/30">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="material-icons-outlined text-emerald-500">account_tree</span>
              6-Level Betting Commissions
            </h2>
            <p className="text-xs text-muted mt-1">Set the % of the member's bet amount that automatically goes to the upstream agents.</p>
          </div>
          
          <div className="p-6 space-y-5">
            {[1, 2, 3, 4, 5, 6].map((level) => {
              const fieldName = `level${level}` as keyof typeof bettingCommission;
              return (
                <div key={level} className="flex items-center gap-4">
                  <div className="w-24 shrink-0 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-foreground">
                      L{level}
                    </span>
                    <span className="text-sm font-medium text-muted">Level {level}</span>
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={bettingCommission[fieldName]}
                      onChange={(e) => updateCommission(fieldName, e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">%</span>
                  </div>
                </div>
              );
            })}

            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
                Example: If Level 1 is set to 0.6%, an agent will receive ₹0.60 for every ₹100 bet placed by their direct referral.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
