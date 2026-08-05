"use client";

import { useState, useEffect } from "react";
import { getSetting, saveSetting } from "@/lib/actions/settings";
import { Save, Loader2, AlertCircle, Plus, Trash2 } from "lucide-react";

type RechargeTier = {
  id: string;
  min: string;
  max: string;
  memberBonus: string;
  agentBonus: string;
};

type RechargeSettings = {
  firstRecharge: RechargeTier[];
  secondRecharge: RechargeTier[];
  thirdRecharge: RechargeTier[];
};

export default function CommissionSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [rechargeBonus, setRechargeBonus] = useState<RechargeSettings>({
    firstRecharge: [],
    secondRecharge: [],
    thirdRecharge: []
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
          try {
            const parsed = JSON.parse(rechargeStr);
            if (Array.isArray(parsed.firstRecharge)) {
              setRechargeBonus(parsed);
            }
          } catch(e) {}
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

  const addTier = (type: keyof RechargeSettings) => {
    const newTier: RechargeTier = {
      id: Math.random().toString(36).substring(7),
      min: "",
      max: "",
      memberBonus: "",
      agentBonus: ""
    };
    setRechargeBonus(prev => ({
      ...prev,
      [type]: [...prev[type], newTier]
    }));
  };

  const removeTier = (type: keyof RechargeSettings, id: string) => {
    setRechargeBonus(prev => ({
      ...prev,
      [type]: prev[type].filter(t => t.id !== id)
    }));
  };

  const updateTier = (type: keyof RechargeSettings, id: string, field: keyof RechargeTier, value: string) => {
    setRechargeBonus(prev => ({
      ...prev,
      [type]: prev[type].map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  };

  const updateCommission = (field: keyof typeof bettingCommission, value: string) => {
    setBettingCommission(prev => ({ ...prev, [field]: value }));
  };

  const renderTierList = (type: keyof RechargeSettings, title: string) => {
    const tiers = rechargeBonus[type];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">{title}</h3>
          <button 
            onClick={() => addTier(type)}
            className="flex items-center gap-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1.5 rounded font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Tier
          </button>
        </div>
        
        {tiers.length === 0 ? (
          <div className="text-center py-6 bg-surface-2/30 rounded-lg border border-dashed border-border text-muted text-sm">
            No tiers added yet. Click "Add Tier" to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {tiers.map((tier, index) => (
              <div key={tier.id} className="relative bg-surface border border-border rounded-lg p-3 pt-4 group">
                <div className="absolute -top-2.5 left-3 bg-surface px-2 text-[10px] font-bold text-muted uppercase tracking-wider">
                  Tier {index + 1}
                </div>
                <button
                  onClick={() => removeTier(type, tier.id)}
                  className="absolute top-2 right-2 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted">Min Deposit (₹)</label>
                    <input
                      type="number"
                      value={tier.min}
                      onChange={(e) => updateTier(type, tier.id, "min", e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full bg-transparent border border-border rounded px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted">Max Deposit (₹)</label>
                    <input
                      type="number"
                      value={tier.max}
                      onChange={(e) => updateTier(type, tier.id, "max", e.target.value)}
                      placeholder="e.g. 999"
                      className="w-full bg-transparent border border-border rounded px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted">Member Bonus</label>
                    <input
                      type="text"
                      value={tier.memberBonus}
                      onChange={(e) => updateTier(type, tier.id, "memberBonus", e.target.value)}
                      placeholder="e.g. 150 or 5%"
                      className="w-full bg-transparent border border-border rounded px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted">Agent Bonus</label>
                    <input
                      type="text"
                      value={tier.agentBonus}
                      onChange={(e) => updateTier(type, tier.id, "agentBonus", e.target.value)}
                      placeholder="e.g. 50 or 10%"
                      className="w-full bg-transparent border border-border rounded px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-zinc-400 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full pb-24">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        
        {/* Recharge Bonuses Card */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border/50 bg-surface-2/30">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="material-icons-outlined text-indigo-500">card_giftcard</span>
              Tiered Recharge Bonuses
            </h2>
            <p className="text-xs text-muted mt-1">Set the flat amount (₹) or percentage (%) bonus for members and agents based on deposit tiers.</p>
          </div>
          
          <div className="p-6 space-y-8">
            {renderTierList("firstRecharge", "1st Recharge Tiers")}
            <div className="h-px bg-border/50 w-full" />
            {renderTierList("secondRecharge", "2nd Recharge Tiers")}
            <div className="h-px bg-border/50 w-full" />
            {renderTierList("thirdRecharge", "3rd Recharge Tiers")}
          </div>
        </div>

        {/* Multi-Level Betting Commission Card */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm xl:sticky top-6">
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
