
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/home/BottomNav";
import { getMyBets } from "@/lib/wingoApi";
import { ChevronDown } from "lucide-react";
import LoadingDialog from "@/components/auth/LoadingDialog";

export default function OrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0); // 0: ALL, 1: UNDELIVER, 2: UNRECEIVE, 3: SUCCESS
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBetId, setExpandedBetId] = useState(null);

  const formatPeriodId = (id) => {
    if (!id) return "";
    const str = String(id);
    if (str.length > 11) return str.substring(0, 8) + str.substring(str.length - 3);
    return str;
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getMyBets({ limit: 100 })
      .then((res) => {
        if (mounted && res?.data?.bets) {
          setOrders(res.data.bets);
        }
      })
      .catch((err) => console.error("Failed to fetch orders:", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const TABS = ["ALL", "UNDELIVER", "UNRECEIVE", "SUCCESS"];

  const filteredOrders = orders.filter((bet) => {
    if (activeTab === 0) return true; // ALL
    if (activeTab === 1) return bet.state === "pending"; // UNDELIVER
    if (activeTab === 2) return bet.state !== "pending" && bet.state !== "won"; // UNRECEIVE
    if (activeTab === 3) return bet.state === "won"; // SUCCESS
    return true;
  });

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 w-full">
        <button onClick={() => router.back()} className="text-white bg-transparent border-none outline-none flex items-center cursor-pointer p-0">
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </button>
        <span className="text-[17px] font-normal text-white">Orders</span>
      </nav>

      {/* Tabs */}
      <div className="bg-[#009688] flex border-b border-white/20 select-none w-full sticky top-[50px] z-10">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`flex-1 py-3 text-center text-[12px] font-medium border-none bg-transparent cursor-pointer transition-colors ${
              activeTab === idx ? "text-white border-b-[3px] border-white" : "text-white/70"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="w-full">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-[14px]">Loading...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-[14px]">No data available</div>
        ) : (
          <div className="flex flex-col bg-white">
            {filteredOrders.map((bet) => {
              const id = bet._id || bet.id;
              const isExpanded = expandedBetId === id;
              const stateText = bet.state === "pending" ? "Wait" : bet.state === "won" ? "Success" : "Fail";
              const stateColor = bet.state === "won" ? "text-[#4caf50]" : bet.state === "pending" ? "text-[#ff9800]" : "text-[#f44336]";

              const feeVal = Number(bet.amount || 0) * 0.05;
              const deliveryVal = Number(bet.amount || 0) - feeVal;

              let calculatedWinAmount = deliveryVal * 2; 
              const typeUpper = String(bet.betType || bet.details?.betType || "").toUpperCase();
              const valueUpper = String(bet.betValue || bet.details?.betValue || "").toUpperCase();
              const amountVal = Number(bet.amount || 0);

              if (typeUpper === "NUMBER") {
                calculatedWinAmount = amountVal * 8.6;
              } else if (typeUpper === "COLOR") {
                if (valueUpper === "VIOLET") {
                  calculatedWinAmount = amountVal * 4.5;
                } else {
                  const colors = bet.resultColors || [];
                  const isVioletWin = colors.includes("violet");
                  if (isVioletWin) {
                    calculatedWinAmount = amountVal * 1.425;
                  } else {
                    calculatedWinAmount = amountVal * 1.9;
                  }
                }
              } else if (typeUpper === "BIG_SMALL") {
                calculatedWinAmount = amountVal * 1.9;
              }

              let contractMoney = 10;
              let contractCount = 1;
              const presets = [10000, 1000, 100, 10];
              for (const p of presets) {
                if (amountVal >= p && amountVal % p === 0) {
                  contractMoney = p;
                  contractCount = amountVal / p;
                  break;
                }
              }
              if (amountVal < 10) {
                contractMoney = 1;
                contractCount = amountVal;
              }

              const amountStr = bet.state === "pending" 
                ? "" 
                : bet.state === "won" 
                ? `+${Number(calculatedWinAmount).toFixed(2)}` 
                : `-${Number(deliveryVal).toFixed(2)}`;

              const displayPeriodId = formatPeriodId(bet.periodId);

              const formatCreateTime = (isoStr) => {
                if (!isoStr) return "";
                try {
                  const d = new Date(isoStr);
                  const yyyy = d.getFullYear();
                  const mm = String(d.getMonth() + 1).padStart(2, "0");
                  const dd = String(d.getDate()).padStart(2, "0");
                  const hh = String(d.getHours()).padStart(2, "0");
                  const min = String(d.getMinutes()).padStart(2, "0");
                  const ss = String(d.getSeconds()).padStart(2, "0");
                  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
                } catch {
                  return isoStr;
                }
              };
              
              return (
                <div key={id} className="flex flex-col border-b border-[#f5f5f5]">
                  <div className="flex justify-between items-center px-4 py-3 cursor-pointer bg-white" onClick={() => setExpandedBetId(isExpanded ? null : id)}>
                    <div className="flex items-center text-[13px] font-normal">
                      <span className="text-[#333] mr-8">{displayPeriodId}</span>
                      <span className={`${stateColor} mr-4`}>{stateText}</span>
                      <span className={stateColor}>{amountStr}</span>
                    </div>
                    <div className="flex items-center">
                      <ChevronDown size={16} strokeWidth={1.5} className={`text-[#ccc] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-3 bg-white text-[12px] text-[#666] flex flex-col gap-1.5 border-t border-dashed border-[#eee] pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Order Number</span>
                        <span>{bet.orderNumber || id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Period</span>
                        <span>{displayPeriodId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contract Money</span>
                        <span>₹{contractMoney.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contract Count</span>
                        <span>{contractCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fee</span>
                        <span>₹{Number(feeVal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Delivery</span>
                        <span>₹{Number(deliveryVal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Select</span>
                        <span className="text-[#4caf50] capitalize">{bet.details?.betValue || bet.betValue || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status</span>
                        <span className={stateColor}>{stateText}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount</span>
                        <span className={stateColor}>{amountStr}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Create Time</span>
                        <span>{formatCreateTime(bet.createdAt)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
      <LoadingDialog visible={loading} />
    </main>
  );
}

