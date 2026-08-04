"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getRecentResults, getCurrentPeriod } from "@/lib/wingoApi";

export default function TrendPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") || "bcone";

  const [history, setHistory] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showType, setShowType] = useState("number"); // "number" or "period"

  useEffect(() => {
    async function loadData() {
      try {
        const [periodRes, resultsRes] = await Promise.all([
          getCurrentPeriod(typeParam),
          getRecentResults(typeParam, 200),
        ]);

        if (periodRes.success) {
          setCurrentPeriod(periodRes.data.periodId);
          setCountdown(periodRes.data.remainingSeconds);
        }
        if (resultsRes.success && resultsRes.data) {
          setHistory(resultsRes.data);
        }
      } catch (err) {
        console.error("Failed to load trend data:", err);
      }
    }
    loadData();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadData();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [typeParam]);

  const formatTime = (secs) => {
    if (secs < 0) return "00 : 00";
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m} : ${s}`;
  };

  const prePeriod = history.length > 0 ? history[0] : null;

  // Stats
  const redCount = history.filter((h) => h.colors.includes("red")).length;
  const greenCount = history.filter((h) => h.colors.includes("green")).length;
  const violetCount = history.filter((h) => h.colors.includes("violet")).length;

  // Build Big Road Grid (top grid)
  const buildBigRoad = () => {
    const data = [...history].reverse(); // Oldest to newest
    const columns = [];
    let currentCol = [];
    let lastColor = null;

    for (let item of data) {
      let colorClass = item.resultNumber % 2 === 0 ? "red" : "green";
      
      if (lastColor === null || lastColor === colorClass) {
        currentCol.push({ ...item, colorClass });
      } else {
        columns.push(currentCol);
        currentCol = [{ ...item, colorClass }];
      }
      lastColor = colorClass;
    }
    if (currentCol.length > 0) columns.push(currentCol);
    return columns;
  };

  const bigRoadCols = buildBigRoad();
  
  // To ensure the grid scrolls to the far right natively
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [bigRoadCols]);

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden pb-10">
      <div className="flex items-center px-4 py-3 bg-white border-b sticky top-0 z-10 shadow-sm">
        <ArrowLeft className="w-6 h-6 text-gray-700 cursor-pointer" onClick={() => router.back()} />
        <h1 className="flex-1 text-center text-[16px] font-medium text-gray-800 capitalize">{typeParam} Record</h1>
        <div className="w-6 h-6"></div>
      </div>

      <div className="px-4 py-3 flex justify-between items-center mt-2">
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm mb-1">Period</span>
          <span className="text-xl font-medium text-gray-800">{currentPeriod || "---"}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-500 text-sm mb-1">Count Down</span>
          <div className="flex gap-1 text-xl font-mono text-gray-800 font-medium">
            <span className="bg-gray-100 rounded px-1">{formatTime(countdown).substring(0,2)}</span>
            <span>:</span>
            <span className="bg-gray-100 rounded px-1">{formatTime(countdown).substring(5,7)}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 flex justify-between items-center border-b border-gray-100">
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm mb-1">PrePeriod</span>
          <span className="text-lg font-medium text-gray-800">{prePeriod?.periodId || "---"}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-gray-500 text-sm mb-1">Result</span>
          {prePeriod && (
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
              prePeriod.colors.includes("violet") && prePeriod.colors.includes("red") ? "bg-gradient-to-br from-red-500 to-purple-500" :
              prePeriod.colors.includes("violet") && prePeriod.colors.includes("green") ? "bg-gradient-to-br from-green-500 to-purple-500" :
              prePeriod.colors.includes("red") ? "bg-red-500" : "bg-green-500"
            }`}>
              {prePeriod.resultNumber}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-500 text-sm mb-1">OpenPrice</span>
          <span className="text-lg font-medium text-pink-500">45436</span>
        </div>
      </div>

      <div className="flex justify-between px-8 py-4 text-sm font-medium">
        <span className="text-red-500">Red:{redCount}</span>
        <span className="text-green-500">Green:{greenCount}</span>
        <span className="text-purple-500">Violet:{violetCount}</span>
      </div>

      <div className="px-4 flex justify-end gap-2 mb-2">
        <button 
          className={`px-3 py-1 text-xs font-medium rounded ${showType === "period" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"}`}
          onClick={() => setShowType("period")}
        >
          ShowPeriod
        </button>
        <button 
          className={`px-3 py-1 text-xs font-medium rounded ${showType === "number" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"}`}
          onClick={() => setShowType("number")}
        >
          ShowOpenNum
        </button>
      </div>

      {/* Top Grid (Big Road) */}
      <div className="px-2 mb-6">
        <div 
          className="overflow-x-auto pb-4 flex" 
          ref={scrollRef}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex bg-white border border-gray-200">
            {/* Y-axis Labels (1-7) */}
            <div className="flex flex-col border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <div key={num} className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs text-gray-500 border-b border-gray-200">
                  {num}
                </div>
              ))}
            </div>

            {/* Matrix */}
            <div className="flex">
              {bigRoadCols.map((col, cIdx) => {
                const overflowCols = Math.ceil(col.length / 7);
                const colChunks = [];
                for(let i=0; i<overflowCols; i++) {
                  colChunks.push(col.slice(i*7, (i+1)*7));
                }
                
                return colChunks.map((chunk, chunkIdx) => (
                  <div key={`${cIdx}-${chunkIdx}`} className="flex flex-col border-r border-gray-100">
                    {[0, 1, 2, 3, 4, 5, 6].map((rIdx) => {
                      const item = chunk[rIdx];
                      return (
                        <div key={rIdx} className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border-b border-gray-100 p-[2px]">
                          {item && (
                            <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-medium ${
                              showType === "number" ? "text-[10px] sm:text-xs" : "text-[8px] sm:text-[9px] tracking-tighter scale-90"
                            } ${
                              item.colors.includes("violet") && item.colors.includes("red") ? "bg-gradient-to-br from-red-500 to-purple-500" :
                              item.colors.includes("violet") && item.colors.includes("green") ? "bg-gradient-to-br from-green-500 to-purple-500" :
                              item.colors.includes("red") ? "bg-red-500" : "bg-green-500"
                            }`}>
                              {showType === "number" ? item.resultNumber : item.periodId.slice(-3)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ));
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid (Bead Plate) */}
      <div className="px-2 mt-4">
        <div className="overflow-x-auto pb-4 flex" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="flex bg-white border-t border-b border-gray-200 min-w-full">
            {/* Y-axis Labels (1-4) */}
            <div className="flex flex-col border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs text-gray-500">
                  {num}
                </div>
              ))}
            </div>

            {/* Bead Plate Matrix (simply chunks of 4) */}
            <div className="flex">
              {Array.from({ length: Math.ceil(history.length / 4) }).map((_, cIdx) => (
                <div key={cIdx} className="flex flex-col border-r border-gray-100">
                  {[0, 1, 2, 3].map((rIdx) => {
                    const hData = [...history].reverse();
                    const item = hData[cIdx * 4 + rIdx];
                    return (
                      <div key={rIdx} className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border-b border-gray-100 p-[2px]">
                        {item && (
                          <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-medium ${
                            showType === "number" ? "text-[10px] sm:text-xs" : "text-[8px] sm:text-[9px] tracking-tighter scale-90"
                          } ${
                            item.colors.includes("violet") && item.colors.includes("red") ? "bg-gradient-to-br from-red-500 to-purple-500" :
                            item.colors.includes("violet") && item.colors.includes("green") ? "bg-gradient-to-br from-green-500 to-purple-500" :
                            item.colors.includes("red") ? "bg-red-500" : "bg-green-500"
                          }`}>
                            {showType === "number" ? item.resultNumber : item.periodId.slice(-3)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
