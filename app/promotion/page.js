
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/home/BottomNav";
import LoadingDialog from "@/components/auth/LoadingDialog";

export default function PromotionPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const noticeShown = localStorage.getItem("promotion_notice_shown");
      if (!noticeShown) {
        setShowNotice(true);
      }
    }

    let mounted = true;
    setLoading(true);

    fetch("/api/referrals/me?date=all", {
      headers: {
        "Authorization": `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`
      }
    })
      .then(res => res.json())
      .then(res => {
        if (mounted && res?.success) {
          setData(res.data);
        }
      })
      .catch(err => console.error("Failed to fetch referrals:", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const closeNotice = () => {
    setShowNotice(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("promotion_notice_shown", "true");
    }
  };

  const referralCode = data?.referralCode || "";
  const referralLink = typeof window !== "undefined" && referralCode 
    ? `${window.location.origin}/register?ref=${referralCode}` 
    : "";

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referrals = data?.referrals || [];
  
  const levelCounts = {
    1: referrals.filter(r => r.level === 1).length,
    2: referrals.filter(r => r.level === 2).length,
    3: referrals.filter(r => r.level === 3).length,
  };

  const filteredReferrals = referrals
    .filter(r => r.level === activeLevel)
    .filter(r => {
      if (!searchQuery) return true;
      return String(r.uid || "").includes(searchQuery) || String(r.phoneMasked || "").includes(searchQuery);
    });

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222] font-sans">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center justify-between sticky top-0 z-10 w-full">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-white bg-transparent border-none outline-none flex items-center cursor-pointer p-0">
            <span className="material-icons-outlined text-[24px]">arrow_back</span>
          </button>
          <span className="text-[17px] font-normal text-white">Promotion</span>
        </div>
        <button className="text-white bg-transparent border-none outline-none flex items-center cursor-pointer p-0">
          <span className="material-icons-outlined text-[24px]">menu</span>
        </button>
      </nav>

      {/* Bonus Stats Header */}
      <div className="bg-white flex flex-col pt-8 pb-6">
        <div className="flex justify-center text-[20px] font-normal mb-8 text-[#333]">
          Bonus:? {data?.summary?.walletEarnings?.toFixed(2) || "0"}
        </div>
        <div className="flex w-full">
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[13px] text-gray-500 mb-1">Total People</span>
            <span className="text-[16px] text-[#333] font-medium">{data?.summary?.totalReferrals || 0}</span>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[13px] text-gray-500 mb-1">Contribution</span>
            <span className="text-[16px] text-[#333] font-medium">? {data?.summary?.walletEarnings?.toFixed(2) || "0"}</span>
          </div>
        </div>
      </div>

      {/* Referral Link & Code Section */}
      <div className="bg-white px-4 py-3 border-t border-[#f5f5f5]">
        <div className="text-[12px] text-gray-500 mb-1 mt-2">My Promotion Code</div>
        <div className="text-[13px] text-[#333] mb-4 font-normal">{referralCode}</div>
        <div className="text-[12px] text-gray-500 mb-1">My Promotion Link</div>
        <div className="text-[13px] text-[#333] break-all">{referralLink}</div>
      </div>

      <div className="bg-white px-4 py-4 flex justify-center">
        <button 
          onClick={copyLink} 
          className="w-full max-w-[340px] bg-[#f8f8f8] border border-gray-200 text-[#333] text-[13px] py-2 rounded-[4px] cursor-pointer"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      {/* Level Tabs */}
      <div className="flex w-full mt-2 bg-white">
        {[1, 2, 3].map((level) => (
          <div 
            key={level}
            onClick={() => setActiveLevel(level)}
            className={`flex-1 text-center py-3 text-[13px] cursor-pointer transition-colors ${
              activeLevel === level ? "bg-[#e0e0e0] text-[#333]" : "bg-white text-gray-500"
            }`}
          >
            Level {level} ({levelCounts[level] || 0})
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-[#fafafa] p-2 flex items-center">
        <span className="material-icons-outlined text-gray-400 text-[18px] ml-2 absolute">search</span>
        <input 
          type="text" 
          placeholder="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border border-transparent border-b-[#e5e5e5] outline-none text-[13px] py-2 pl-8"
        />
      </div>

      {/* Table Headers */}
      <div className="flex bg-white py-3 border-b border-[#f5f5f5] text-[11px] text-[#333] font-medium text-center">
        <div className="flex-[0.8]">ID</div>
        <div className="flex-1">Phone</div>
        <div className="flex-[1.2]">Water reward</div>
        <div className="flex-1">First reward</div>
      </div>

      {/* Table Content */}
      <div className="bg-white flex flex-col">
        {filteredReferrals.length === 0 ? (
          <div className="py-12 text-center text-[#999] text-[12px]">No data</div>
        ) : (
          filteredReferrals.map((r, i) => (
            <div key={i} className="flex bg-white py-3 border-b border-[#f5f5f5] text-[12px] text-[#333] text-center items-center font-normal">
              <div className="flex-[0.8] truncate px-1">{r.uid || r.id.substring(0, 8)}</div>
              <div className="flex-1 truncate px-1">{r.phoneMasked}</div>
              <div className="flex-[1.2]">{r.commission || 0}</div>
              <div className="flex-1">{r.firstDepositAmount || 0}</div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-white text-[13px] text-[#999] border-b border-[#f5f5f5]">
        <div>1-{Math.min(filteredReferrals.length, 10)} of {filteredReferrals.length}</div>
        <div className="flex gap-4">
          <span className="material-icons-outlined text-[18px] text-[#ccc] cursor-pointer">keyboard_arrow_left</span>
          <span className="material-icons-outlined text-[18px] text-[#ccc] cursor-pointer">keyboard_arrow_right</span>
        </div>
      </div>

      {/* Notice Modal */}
      {showNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white w-full max-w-[340px] rounded-[4px] flex flex-col relative overflow-hidden shadow-xl">
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-[18px] font-normal m-0 text-black">Notice</h3>
            </div>
            <div className="px-6 py-2 text-[14px] text-[#333] leading-[1.6] max-h-[60vh] overflow-y-auto">
              When your friends trade, you will also receive a 30% commission. Therefore, the more friends you invite, the higher your commission. There is a fixed income every day, the commission is permanent, but the reward is only onceWhen they make money, they will invite their friends to join them, and then you can get a 20% commission. In this way, your team can spread quickly. Therefore, I hope everyone can use our platform to make money, make money, and make money!When they make money, they will invite their friends to join them, and then you can get a 20% commission. In this way, your team can spread quickly. Therefore, I hope everyone can use our platform to make money, make money, and make money!Level 1 commission: Friends who join through your own link belong to your level, when they trade, you will get 30% commission.Tier 2 commission: Friends who join through your friend link belong to your secondary commission. When they trade, you can get 20% commission.Level 3 commission: Friends who join through friends of friends belong to your level 3. When they trade, you get 10% commission.Promotional rewards: 10% bonus amount for the first recharge after the first-level lower level joins. If your friend joins through your invitation and recharges 1000 for the first time, you will get 200
            </div>
            <div className="flex justify-end px-6 py-4">
              <button 
                onClick={closeNotice} 
                className="text-[#009688] text-[15px] font-medium uppercase bg-transparent border-none outline-none cursor-pointer tracking-wider"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
      <LoadingDialog visible={loading} />
    </main>
  );
}

