"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";
import { getDeposits } from "@/lib/walletApi";
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import { format } from "date-fns";

export default function RechargeRecordPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let mounted = true;
    const loadRecords = async () => {
      try {
        const res = await getDeposits();
        if (mounted && res?.data) {
          setRecords(res.data);
        }
      } catch (e) {
        console.error("Failed to load deposits", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadRecords();
    return () => { mounted = false; };
  }, []);

  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const displayRecords = records.slice((page - 1) * pageSize, page * pageSize);

  const getStatusDisplay = (status) => {
    switch (status) {
      case "completed":
      case "approved":
        return <span className="text-[#4caf50]">Success</span>;
      case "rejected":
        return <span className="text-[#f44336]">Failed</span>;
      case "pending":
      default:
        return <span className="text-[#ff9800]">Unpaid</span>;
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none">
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 w-full shadow-sm">
        <Link href="/my" className="text-white flex items-center">
          <ChevronLeft size={24} />
        </Link>
        <span className="text-[17px] font-normal text-white">Recharge Record</span>
      </nav>

      <div className="w-full flex flex-col bg-white">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-[14px]">Loading...</div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-[14px]">No data available</div>
        ) : (
          <div className="flex flex-col">
            {displayRecords.map((r, i) => (
              <div key={r.id || i} className="flex flex-col py-3 px-4 border-b border-[#f5f5f5]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#666] text-[15px]">₹ {(r.amount / 100).toFixed(2)}</span>
                  <span className="text-[13px]">{getStatusDisplay(r.status)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#999] text-[12px] font-mono">{r.txHash || r.id}</span>
                  <span className="text-[#999] text-[12px]">{r.channel || "pay"}</span>
                </div>
                <div className="flex justify-start">
                  <span className="text-[#999] text-[12px]">
                    {r.createdAt ? format(new Date(r.createdAt), "yyyy-MM-dd HH:mm") : ""}
                  </span>
                </div>
              </div>
            ))}
            
            {records.length > 0 && (
              <div className="flex items-center justify-end gap-6 px-4 py-3 text-[#999] text-[13px]">
                <span>{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, records.length)} of {records.length}</span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    disabled={page === 1}
                    className="disabled:opacity-30"
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    className="disabled:opacity-30 rotate-180"
                    onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select className="bg-transparent border-b border-[#ccc] text-[#666] outline-none pb-1">
                    <option>10</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
