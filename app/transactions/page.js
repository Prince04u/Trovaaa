"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

export default function TransactionsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    import("@/lib/auth").then(({ getToken }) => {
      fetch("/api/transactions?limit=100", {
        headers: {
          "Authorization": `Bearer ${getToken()}`
        }
      })
      .then(res => res.json())
      .then(res => {
        if (mounted && res?.success) {
          setList(res.data.transactions);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });
    });
    return () => { mounted = false; };
  }, []);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const isAddition = (type) => {
    return ['deposit', 'bonus_credit', 'winning_credit', 'referral_bonus', 'locked_release'].includes(type);
  };

  return (
    <main className="min-h-screen bg-white pb-[60px] flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[46px] px-4 flex items-center gap-3 sticky top-0 z-10 w-full shadow-none">
        <Link href="/account" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </Link>
        <span className="text-[17px] font-normal text-white ml-1">Transactions</span>
      </nav>

      <div className="w-full bg-white flex flex-col">
        {loading ? (
          <div className="py-16 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009688]"></div></div>
        ) : list.length === 0 ? (
          <div className="py-16 text-gray-400 text-[14px] text-center">No data available</div>
        ) : (
          list.map((item, i) => {
            const amount = Number(item.amount) || 0;
            const balAfter = Number(item.balanceAfter) || 0;
            // Calculate previous balance
            const balBefore = isAddition(item.type) ? balAfter - amount : balAfter + amount;

            return (
              <div key={item.id || i} className="flex justify-between items-start py-[12px] px-[15px] border-b border-[#f0f0f0]">
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[13px] font-normal text-[#999999] leading-none">
                    ₹ {amount.toFixed(2)}
                  </span>
                  <span className="text-[14px] font-normal text-[#333333] leading-none my-[2px]">
                    {item.description}
                  </span>
                  <span className="text-[13px] font-normal text-[#999999] leading-none">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                
                <div className="flex flex-col items-end text-right justify-between h-[52px]">
                  <span className="text-[13px] font-normal text-[#999999] leading-none mt-[1px]">
                    ₹ {balBefore.toFixed(2)}
                  </span>
                  <span className="text-[13px] font-normal text-[#999999] leading-none mb-[1px]">
                    ₹ {balAfter.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="w-full bg-white flex items-center justify-center px-4 py-4 mt-2 relative">
        <div className="text-[#999999] text-[13px] font-normal">
          {!loading && list.length > 0 && `1-${list.length} of ${list.length}`}
        </div>
        <div className="absolute right-4 flex gap-10">
          <span className="material-icons-outlined text-[#333333] text-[18px] cursor-pointer">keyboard_arrow_left</span>
          <span className="material-icons-outlined text-[#333333] text-[18px] cursor-pointer">keyboard_arrow_right</span>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}

