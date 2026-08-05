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

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm w-full">
        <Link href="/account" className="text-white text-decoration-none flex items-center">
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </Link>
        <span className="text-[17px] font-normal text-white">Transactions</span>
      </nav>

      <div className="p-4 w-full text-center">
        {loading ? (
          <div className="py-16 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009688]"></div></div>
        ) : list.length === 0 ? (
          <div className="py-16 text-gray-400 text-[14px]">No data available</div>
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((item, i) => (
              <div key={item.id || i} className="bg-white p-4 rounded shadow-sm text-left flex justify-between items-center">
                <div>
                  <p className="font-medium text-[#333] text-[15px]">{item.description}</p>
                  <p className="text-[12px] text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-[16px] ${['deposit', 'bonus_credit', 'winning_credit', 'referral_bonus'].includes(item.type) ? 'text-[#009688]' : 'text-[#f44336]'}`}>
                    {['deposit', 'bonus_credit', 'winning_credit', 'referral_bonus'].includes(item.type) ? '+' : '-'}₹ {item.amount}
                  </p>
                  {item.balanceAfter !== undefined && (
                    <p className="text-[12px] text-gray-500 mt-1">Bal: ₹ {item.balanceAfter}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
