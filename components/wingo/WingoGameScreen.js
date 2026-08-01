"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, ArrowLeft, ArrowRight } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getToken, getUser } from "@/lib/auth";
import { getSocket } from "@/lib/socket";
import {
  getCurrentPeriod,
  getRecentResults,
  placeBet,
  getMyBets,
} from "@/lib/wingoApi";
import { getBalance } from "@/lib/walletApi";
import { getWingoConfig } from "@/lib/platformApi";
import {
  MULTIPLIERS,
  NUMBERS,
  DURATION_SEC,
  formatTimer,
  getColorDots,
  getSize,
  getBetTheme,
  getBetSelectionLabel,
} from "@/lib/wingoUtils";
import { usePlatformStatus } from "@/components/platform/PlatformStatusProvider";
import PreSaleRulesModal from "@/components/wingo/PreSaleRulesModal";
import OutcomePopup from "@/components/games/OutcomePopup";
import { useToasts, ToastStack } from "@/components/ui/Toast";


export default function WingoGameScreen({ duration: propDuration, initialPeriod = null, initialResults = [] }) {
  const params = useParams();
  const router = useRouter();
  const duration = propDuration || params.duration || "parity";
  const { maintenanceMode, blocksAction } = usePlatformStatus();
  const { push, toasts } = useToasts();

  // Seeded from the last known balance in localStorage so the wallet card
  // never flashes ₹0.00 while the client's own fetch is still in flight.
  const [balance, setBalance] = useState(() => {
    if (typeof window === "undefined") return 0;
    const cached = Number(window.localStorage.getItem("lastBalance"));
    return Number.isFinite(cached) ? cached : 0;
  });
  // Seeded with server-fetched data (see app/wingo/[duration]/page.js) so the
  // period/history are on screen immediately — no empty flash while the
  // client's own fetch is in flight.
  const [period, setPeriod] = useState(() => {
    if (typeof window === "undefined") return initialPeriod;
    const cachedPeriod = window.localStorage.getItem(`wingo_period_${duration}`);
    if (cachedPeriod) {
      try {
        const parsed = JSON.parse(cachedPeriod);
        const elapsed = (Date.now() - (parsed.cachedAt || 0)) / 1000;
        const remaining = (Number(parsed.remainingSeconds) || 0) - elapsed;
        if (remaining > 0) {
          return { ...parsed, remainingSeconds: Math.round(remaining) };
        }
      } catch {}
    }
    return null;
  });
  const [results, setResults] = useState(() => {
    if (typeof window === "undefined") return initialResults;
    const cachedResults = window.localStorage.getItem(`wingo_results_${duration}`);
    if (cachedResults) {
      try {
        return JSON.parse(cachedResults);
      } catch {}
    }
    return [];
  });
  const [myBets, setMyBets] = useState(() => {
    if (typeof window === "undefined") return [];
    const cachedBets = window.localStorage.getItem(`wingo_mybets_${duration}`);
    if (cachedBets) {
      try {
        return JSON.parse(cachedBets);
      } catch {}
    }
    return [];
  });

  const [prevDuration, setPrevDuration] = useState(duration);
  if (duration !== prevDuration) {
    setPrevDuration(duration);
    
    let newPeriod = null;
    let newResults = [];
    let newBets = [];
    
    if (typeof window !== "undefined") {
      const cachedPeriod = window.localStorage.getItem(`wingo_period_${duration}`);
      if (cachedPeriod) {
        try {
          const parsed = JSON.parse(cachedPeriod);
          const elapsed = (Date.now() - (parsed.cachedAt || 0)) / 1000;
          const remaining = (Number(parsed.remainingSeconds) || 0) - elapsed;
          if (remaining > 0) {
            newPeriod = { ...parsed, remainingSeconds: Math.round(remaining) };
            endsAtRef.current = Date.now() + remaining * 1000;
          }
        } catch {}
      }
      const cachedResults = window.localStorage.getItem(`wingo_results_${duration}`);
      if (cachedResults) {
        try {
          newResults = JSON.parse(cachedResults);
        } catch {}
      }
      const cachedBets = window.localStorage.getItem(`wingo_mybets_${duration}`);
      if (cachedBets) {
        try {
          newBets = JSON.parse(cachedBets);
        } catch {}
      }
    }
    
    setPeriod(newPeriod);
    setResults(newResults);
    setMyBets(newBets);
    myBetsRef.current = newBets;
  }

  const [historyTab, setHistoryTab] = useState("game");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [gameHistoryPage, setGameHistoryPage] = useState(1);
  const [outcomePopup, setOutcomePopup] = useState(null);
  const myBetsRef = useRef([]);
  const shownOutcomeIdsRef = useRef(new Set());
  // Absolute end-of-round timestamp (ms) that the smooth countdown is derived
  // from, so it never drifts or stutters from competing 1s intervals. Anchored
  // from the server-fetched initial period so the countdown ticks immediately,
  // before the client's own fetch even resolves. Lazily computed once via the
  // guarded-assignment pattern (React docs' recommended way to seed a ref with
  // an impure/expensive value without recomputing it on every render).
  const clockOffsetRef = useRef(0);
  const endsAtRef = useRef(undefined);
  if (endsAtRef.current === undefined) {
    const offset = initialPeriod?.serverTime ? Number(initialPeriod.serverTime) - Date.now() : 0;
    clockOffsetRef.current = offset;
    endsAtRef.current = initialPeriod ? Date.now() + offset + initialPeriod.remainingSeconds * 1000 : null;
  }
  const refreshedPeriodRef = useRef(null);
  const pollTimerRef = useRef(null);

  const [betSheet, setBetSheet] = useState(null);
  const [baseAmount, setBaseAmount] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [quickMultiplier, setQuickMultiplier] = useState(1);
  const [agreed, setAgreed] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [betLimits, setBetLimits] = useState({ minBetAmount: 1, maxBetAmount: 100000 });

  const timer = formatTimer(period?.remainingSeconds ?? 0);
  const remainingSeconds = period?.remainingSeconds ?? 0;
  const showCountdownOverlay = remainingSeconds > 0 && remainingSeconds <= 5;
  const bettingLocked = showCountdownOverlay || loading || maintenanceMode || blocksAction("bet");
  const countdownDigits = timer.ss.split("");
  const totalAmount = baseAmount * (Number(quantity) || 0);
  const betTheme = betSheet ? getBetTheme(betSheet.betType, betSheet.betValue) : "green";
  const durationSeconds = DURATION_SEC[duration];
  const [expandedBetId, setExpandedBetId] = useState(null);
  const myBetsForDuration = myBets;

  const displayResults = useMemo(() => {
    return results.map((r) => {
      const displayPeriodId = String(r.roundNumber || r.periodId);
      return {
        ...r,
        displayPeriodId,
      };
    });
  }, [results]);

  const gameHistoryPageCount = Math.ceil(results.length / 10);

  const stats = useMemo(() => {
    const slice = results.slice(0, 30);
    let green = 0;
    let violet = 0;
    let red = 0;
    slice.forEach((r) => {
      const dots = r.resultColors?.length ? r.resultColors : getColorDots(r.resultNumber);
      if (dots.includes("green")) green++;
      if (dots.includes("violet")) violet++;
      if (dots.includes("red")) red++;
    });
    return { green, violet, red };
  }, [results]);

  // Apply authoritative period data without clobbering the smooth local
  // countdown: only (re)anchor the end time on a new period or when the client
  // has drifted more than 2s from the server.
  const syncPeriod = useCallback((data) => {
    const serverTime = Number(data?.serverTime);
    if (serverTime) {
      clockOffsetRef.current = serverTime - Date.now();
    }
    const serverRemaining = Math.max(0, Math.round(Number(data?.remainingSeconds)) || 0);
    setPeriod((prev) => {
      let serverPeriodId = data?.periodId || prev?.periodId;
      
      // Prevent rewinding the periodId if we already optimistically incremented it locally
      // due to the timer hitting zero just before this lagging server fetch completed.
      try {
        if (prev && String(BigInt(serverPeriodId) + 1n) === String(prev.periodId)) {
          serverPeriodId = prev.periodId;
        }
      } catch {}

      const isNewPeriod = !prev || prev.periodId !== serverPeriodId;
      const offset = clockOffsetRef.current;
      const localRemaining =
        endsAtRef.current != null
          ? Math.max(0, Math.round((endsAtRef.current - (Date.now() + offset)) / 1000))
          : null;
      if (isNewPeriod || localRemaining == null || Math.abs(localRemaining - serverRemaining) > 2) {
        endsAtRef.current = Date.now() + offset + serverRemaining * 1000;
        return { ...prev, ...data, periodId: serverPeriodId, remainingSeconds: serverRemaining };
      }
      return { ...prev, ...data, periodId: serverPeriodId, remainingSeconds: localRemaining };
    });
  }, []);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const publicFetch = Promise.all([getCurrentPeriod(duration), getRecentResults(duration, 50)]);
      const privateFetch = getToken()
        ? Promise.all([getBalance(), getMyBets({ limit: 20, duration })])
        : null;

      let latestResults = null;
      try {
        const [periodRes, resultsRes] = await publicFetch;
        syncPeriod(periodRes.data);
        latestResults = resultsRes.data || [];
        setResults(latestResults);
        localStorage.setItem(`wingo_period_${duration}`, JSON.stringify({ ...periodRes.data, cachedAt: Date.now() }));
        localStorage.setItem(`wingo_results_${duration}`, JSON.stringify(latestResults));
      } catch (err) {
      }

      if (privateFetch) {
        try {
          const [balanceRes, betsRes] = await privateFetch;
          setBalance(balanceRes.data.balance);
          if (typeof window !== "undefined") {
            window.localStorage.setItem("lastBalance", String(balanceRes.data.balance));
          }
          const newBets = betsRes.data?.bets || [];

          // Detect bets that just resolved (pending -> won/lost) since the last
          // poll and show the win/loss popup for them.
          const prevById = new Map(myBetsRef.current.map((b) => [b._id || b.id, b]));
          for (const bet of newBets) {
            const id = bet._id || bet.id;
            const prevBet = prevById.get(id);
            const justResolved =
              prevBet &&
              prevBet.state === "pending" &&
              (bet.state === "won" || bet.state === "lost") &&
              !shownOutcomeIdsRef.current.has(id);
            if (justResolved) {
              shownOutcomeIdsRef.current.add(id);
              const matchedResult = (latestResults || results).find(
                (r) => String(r.periodId) === String(bet.periodId)
              );
              const resultNumber =
                bet.resultNumber != null ? bet.resultNumber : matchedResult?.resultNumber;
              setOutcomePopup({
                show: true,
                type: bet.state === "won" ? "win" : "lose",
                amount: bet.state === "won" ? bet.winAmount : bet.amount,
                periodId: bet.periodId,
                number: resultNumber,
                colors:
                  bet.resultColors?.length
                    ? bet.resultColors
                    : resultNumber != null
                    ? getColorDots(resultNumber)
                    : [],
                size: bet.resultSize
                  ? bet.resultSize.charAt(0).toUpperCase() + bet.resultSize.slice(1)
                  : resultNumber != null
                  ? getSize(resultNumber)
                  : "",
              });
            }
          }
          const serverBetIds = new Set(newBets.map((b) => b._id || b.id));
          const missingPendingBets = myBetsRef.current.filter((b) => 
            (b.status === "pending" || b.state === "pending") && !serverBetIds.has(b._id || b.id)
          );
          const combinedBets = [...missingPendingBets, ...newBets];

          myBetsRef.current = combinedBets;
          setMyBets(combinedBets);
          localStorage.setItem(`wingo_mybets_${duration}`, JSON.stringify(combinedBets));
        } catch {}
      }
    } finally {
      setRefreshing(false);
    }
  }, [duration, syncPeriod, results]);

  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  
  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setIsAuthInitialized(true);
    loadData();
    getWingoConfig()
      .then((res) => {
        if (res?.data?.minBetAmount != null || res?.data?.maxBetAmount != null) {
          setBetLimits({
            minBetAmount: Number(res.data.minBetAmount) || 1,
            maxBetAmount: Number(res.data.maxBetAmount) || 100000,
          });
        }
      })
      .catch(() => {});

    let activeSocket = null;
    let cancelled = false;

    const userObj = getUser();
    getSocket().then((socket) => {
      if (!socket || cancelled) return;

      activeSocket = socket;
      socket.emit("join:wingo", duration);
      socket.emit("join:user");
      if (userObj && userObj._id) {
        socket.emit("auth:register", userObj._id);
      }

      socket.on("wallet:updated", (data) => setBalance(data.balance));
      socket.on("wallet:balance", (data) => setBalance(data.balance));
    });

    return () => {
      cancelled = true;
      if (activeSocket) {
        activeSocket.off("wallet:updated");
        activeSocket.off("wallet:balance");
      }
    };
  }, [duration, loadData, router]);

  useEffect(() => {
    const smoothTick = setInterval(() => {
      if (endsAtRef.current == null) return;
      const offset = clockOffsetRef.current;
      const remaining = Math.max(0, Math.round((endsAtRef.current - (Date.now() + offset)) / 1000));
      setPeriod((prev) => {
        if (!prev) return prev;
        let currentPeriodId = prev.periodId;
        if (remaining === 0 && prev.remainingSeconds > 0) {
          try {
            currentPeriodId = String(BigInt(prev.periodId) + 1n);
          } catch (e) {
            console.error(e);
          }
        }
        if (prev.remainingSeconds === remaining && prev.periodId === currentPeriodId) return prev;
        return { ...prev, periodId: currentPeriodId, remainingSeconds: remaining };
      });
      if (remaining === 0 && refreshedPeriodRef.current !== period?.periodId) {
        refreshedPeriodRef.current = period?.periodId;
        const endedPeriodId = period?.periodId;
        
        // Optimistically update endsAtRef to seamlessly start the next countdown
        // instead of hanging at 00:00 while the server responds.
        endsAtRef.current = Date.now() + offset + DURATION_SEC[duration] * 1000;
        
        loadData();

        clearInterval(pollTimerRef.current);
        pollTimerRef.current = setInterval(async () => {
          try {
            const resultsRes = await getRecentResults(duration, 50);
            const latest = resultsRes.data || [];
            const isSettled = latest.some(r => String(r.periodId) === String(endedPeriodId));
            if (isSettled) {
              clearInterval(pollTimerRef.current);
              loadData();
            }
          } catch (e) {
            console.error(e);
          }
        }, 2000);
      }
    }, 250);

    return () => {
      clearInterval(smoothTick);
      clearInterval(pollTimerRef.current);
    };
  }, [duration, loadData, period?.periodId]);

  useEffect(() => {
    const refreshInterval = setInterval(() => { loadData(); }, 4000);
    return () => clearInterval(refreshInterval);
  }, [loadData]);

  useEffect(() => {
    if (showCountdownOverlay && betSheet) {
      setBetSheet(null);
    }
  }, [showCountdownOverlay, betSheet]);

  const openBetSheet = (betType, betValue) => {
    if (showCountdownOverlay || maintenanceMode || blocksAction("bet")) return;
    setBetSheet({ betType, betValue });
    setBaseAmount(1);
    setQuantity(quickMultiplier);
    setAgreed(true);
  };

  const submitBet = async () => {
    if (!betSheet || !agreed) return;
    if ((Number(quantity) || 0) <= 0) {
      push("Please enter a valid quantity of 1 or more.", "error");
      return;
    }
    if (totalAmount < betLimits.minBetAmount || totalAmount > betLimits.maxBetAmount) {
      push(`Bet amount must be between ₹${betLimits.minBetAmount} and ₹${betLimits.maxBetAmount.toLocaleString("en-IN")}`, "error");
      return;
    }
    setLoading(true);
    const deductedAmount = totalAmount;
    setBalance(prev => Math.max(0, prev - deductedAmount));
    const { betType, betValue } = betSheet;
    const generatedId = `opt-${Date.now()}`;
    const durationSecs = duration === "parity" || duration === "bcone" ? 180 : duration === "sapre" ? 60 : duration === "emerd" ? 300 : duration === "30s" ? 30 : duration === "1m" ? 60 : duration === "3m" ? 180 : duration === "5m" ? 300 : 600;
    
    const optimisticBet = {
      _id: generatedId,
      id: generatedId,
      periodId: String(period?.periodId || ""),
      amount: totalAmount,
      winAmount: 0,
      payoutRatio: 0,
      state: "pending",
      status: "pending",
      createdAt: new Date().toISOString(),
      resultNumber: null,
      resultColors: [],
      resultSize: "",
      betType,
      betValue: String(betValue),
      duration: durationSecs,
      orderNumber: `WG${period?.periodId || ""}${generatedId.slice(-8)}`.toUpperCase(),
      details: {
        betType,
        betValue: String(betValue),
        duration,
      }
    };

    setMyBets(prev => [optimisticBet, ...prev]);
    myBetsRef.current = [optimisticBet, ...myBetsRef.current];
    setBetSheet(null);

    try {
      const res = await placeBet(duration, {
        betType,
        betValue: String(betValue),
        amount: totalAmount,
        idempotencyKey: `${period?.periodId}_${betType}_${betValue}_${Date.now()}`,
      });
      
      const betData = res.data;
      if (betData?._id || betData?.id) {
        const realId = betData?._id || betData?.id;
        const updatedBet = {
          ...optimisticBet,
          _id: realId,
          id: realId,
          orderNumber: `WG${period?.periodId || ""}${realId.slice(-8)}`.toUpperCase()
        };
        setMyBets(prev => prev.map(b => b.id === generatedId ? updatedBet : b));
        myBetsRef.current = myBetsRef.current.map(b => b.id === generatedId ? updatedBet : b);
      }

      push("Bet Successful", "success");
      setLoading(false);
      loadData();
    } catch (err) {
      setBalance(prev => prev + deductedAmount);
      setMyBets(prev => prev.filter(b => b.id !== generatedId));
      myBetsRef.current = myBetsRef.current.filter(b => b.id !== generatedId);
      const errMsg = getBetErrorMessage(err);
      push(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const openRules = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setRulesOpen(true);
  };

  const getBetErrorMessage = (err) => {
    const msg = err.response?.data?.message || "Bet failed";
    if (/replica set|mongos|Transaction numbers/i.test(msg)) {
      return "Bet could not be processed. Please try again.";
    }
    return msg;
  };

  const getPrice = (r) => {
    const periodNum = Number(r.periodId?.toString().slice(-3)) || 0;
    const offset = (r.resultNumber || 0) * 7;
    return 15000 + periodNum + offset;
  };

  if (!isAuthInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#009688" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-10 h-10 animate-spin"
        >
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </div>
    );
  }

  return (
    <main className="wingo-game">
      {/* Solid Green Available Balance Banner */}
      <section className="wg-dashboard-header">
        <div className="flex items-center w-full">
          <div className="flex items-center gap-1.5 text-white">
            <span className="text-[16px] font-normal">Available balance: ₹ {Number(balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-[12px]">
            <Link href="/wallet/deposit" className="wg-btn-recharge">
              Recharge
            </Link>
            <button 
              type="button"
              onClick={() => setHistoryTab("chart")}
              className="wg-btn-trend"
            >
              Trend
            </button>
          </div>
          
          <button 
            type="button" 
            onClick={loadData}
            className="text-white hover:opacity-80"
            aria-label="Refresh balance"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className={`w-[20px] h-[20px] ${refreshing ? "animate-spin" : ""}`}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </section>

      {/* Category Tabs (Showing only active or all but styled minimally) */}
      <section className="wg-duration-bar">
        <div className="wg-duration-tab mx-auto w-full text-center text-[#333]">
          {duration.charAt(0).toUpperCase() + duration.slice(1)}
        </div>
      </section>

      {/* Period & Count Down Card */}
      <section className="wg-timer-card select-none">
        <div className="flex justify-between w-full">
          <div className="flex flex-col gap-1">
            <div className="wg-period-label">
              <Trophy size={16} className="text-gray-400" strokeWidth={2} />
              <span>Period</span>
            </div>
            <div className="wg-period-id mt-0 underline">
              {period?.periodId || "—"}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <span className="wg-countdown-label">Count Down</span>
            <div className="wg-timer-digits mt-0">
              {(() => {
                const minDigits = timer.mm.split("");
                const secDigits = timer.ss.split("");
                return (
                  <>
                    <div className="wg-digit-box">{minDigits[0]}</div>
                    <div className="wg-digit-box">{minDigits[1]}</div>
                    <span className="wg-timer-colon">:</span>
                    <div className="wg-digit-box">{secDigits[0]}</div>
                    <div className="wg-digit-box">{secDigits[1]}</div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Betting Board Section */}
      <section className="wg-betting-board">
        {/* Color Buttons row */}
        <div className="flex justify-between items-center gap-[10px] w-full">
          <button 
            type="button" 
            className="wg-color-btn green flex-1" 
            disabled={bettingLocked} 
            onClick={() => openBetSheet("color", "green")}
          >
            Join Green
          </button>
          <button 
            type="button" 
            className="wg-color-btn violet flex-1" 
            disabled={bettingLocked} 
            onClick={() => openBetSheet("color", "violet")}
          >
            Join Violet
          </button>
          <button 
            type="button" 
            className="wg-color-btn red flex-1" 
            disabled={bettingLocked} 
            onClick={() => openBetSheet("color", "red")}
          >
            Join Red
          </button>
        </div>

        {/* Numbers Grid */}
        <div className="wg-number-grid">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
               key={num}
               type="button"
               className="wg-num-btn blue"
               disabled={bettingLocked}
               onClick={() => openBetSheet("number", num)}
             >
               {num}
             </button>
          ))}
        </div>
      </section>

      {/* History and Tabs lists */}
      <section className="wg-logs-card bg-white">
        <div className="flex flex-col items-center justify-center pt-5 pb-3 border-b-2 border-[#009688] text-[#333] font-normal text-[15px]">
          <Trophy size={18} className="text-gray-500 mb-1" />
          <span>{duration.charAt(0).toUpperCase() + duration.slice(1)} Record</span>
        </div>
        <div className="overflow-x-auto select-none">
          <table className="wg-history-table w-full">
            <thead>
              <tr>
                <th>Period</th>
                <th>Price</th>
                <th>Number</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {displayResults.slice((gameHistoryPage - 1) * 10, gameHistoryPage * 10).map((r) => {
                const dots = r.resultColors?.length ? r.resultColors : getColorDots(r.resultNumber);
                const numberClass = r.resultNumber % 2 === 1 ? "green" : "red";

                return (
                  <tr key={r.periodId}>
                    <td className="wg-period-cell text-gray-700 underline">{r.displayPeriodId}</td>
                    <td className="text-gray-400">{getPrice(r)}</td>
                    <td className={`wg-number-cell ${numberClass}`}>{r.resultNumber}</td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        {dots.map((color, idx) => (
                          <span key={idx} className={`wg-result-dot ${color.toLowerCase()}`} />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {results.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No history records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {gameHistoryPageCount > 1 && (
          <div className="flex items-center justify-center gap-10 py-4 text-[#888] select-none text-[13px]">
            <span>1-10 of {results.length}</span>
            <div className="flex items-center gap-8">
              <button
                type="button"
                className="disabled:opacity-30 cursor-pointer"
                disabled={gameHistoryPage === 1}
                onClick={() => setGameHistoryPage((p) => p - 1)}
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                className="disabled:opacity-30 cursor-pointer"
                disabled={gameHistoryPage === gameHistoryPageCount}
                onClick={() => setGameHistoryPage((p) => p + 1)}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-6 border-t border-[#dddddd] text-[#888] text-[14px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-60">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="9"></line>
            <line x1="9" y1="13" x2="15" y2="13"></line>
            <line x1="9" y1="17" x2="15" y2="17"></line>
          </svg>
          <span>My Record</span>
        </div>


        {historyTab === "chart" && (
          <div className="p-4 select-none">
            <div className="flex justify-between items-center text-xs text-gray-500 font-bold mb-3 border-b border-gray-100 pb-2">
              <span>Statistic (Recent 30 rounds)</span>
              <div className="flex gap-3">
                <span className="text-[#009688]">Green: {stats.green}</span>
                <span className="text-[#8E24AA]">Violet: {stats.violet}</span>
                <span className="text-[#F44336]">Red: {stats.red}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
              {results.slice(0, 30).map((r) => {
                return (
                  <div key={r.periodId} className="flex items-center gap-3 py-1.5 border-b border-dashed border-gray-100 text-xs">
                    <span className="text-gray-500 font-semibold">{String(r.periodId).slice(-4)}</span>
                    <div className="flex-1 grid grid-cols-10 gap-1.5">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                        const active = r.resultNumber === n;
                        let cellBg = "bg-transparent";
                        if (active) {
                          cellBg = n === 0 ? "bg-gradient-to-tr from-[#8E24AA] to-[#F44336] text-white" :
                                   n === 5 ? "bg-gradient-to-tr from-[#8E24AA] to-[#009688] text-white" :
                                   n % 2 === 1 ? "bg-[#009688] text-white" : "bg-[#F44336] text-white";
                        }
                        return (
                          <div 
                            key={n} 
                            className={`h-5 flex items-center justify-center rounded-full font-black text-[10px] ${cellBg} ${
                              !active ? "text-gray-300 border border-gray-100" : ""
                            }`}
                          >
                            {n}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {historyTab === "my" && (
          <div className="p-2 select-none flex flex-col gap-2.5">
            {myBetsForDuration.slice((gameHistoryPage - 1) * 10, gameHistoryPage * 10).map((bet) => {
              const id = bet._id || bet.id;
              const isExpanded = expandedBetId === id;
              const betDisplayLabel = getBetSelectionLabel(bet.betType, bet.betValue);
              const dateStr = bet.createdAt ? new Date(bet.createdAt).toLocaleString("en-IN") : "";
              const stateClass = bet.state === "won" ? "text-[#009688] font-black" : bet.state === "lost" ? "text-gray-400 font-semibold" : "text-amber-500 font-semibold";
              
              return (
                <div key={id} className="border border-gray-100 rounded-lg p-3 bg-gray-50 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedBetId(isExpanded ? null : id)}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{bet.periodId}</span>
                      <span className="text-gray-400">({betDisplayLabel})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={stateClass}>
                        {bet.state === "pending"
                          ? "Pending"
                          : bet.state === "won"
                          ? `+₹${Number(bet.winAmount).toFixed(2)}`
                          : `-₹${Number(bet.amount).toFixed(2)}`}
                      </span>
                      <span className={`w-1.5 h-1.5 border-r border-b border-gray-400 transform transition-transform ${
                        isExpanded ? "rotate-225" : "rotate-45"
                      }`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-dashed border-gray-200 flex flex-col gap-1.5 text-gray-500">
                      <div className="flex justify-between"><span>Amount:</span><strong>₹{Number(bet.amount).toFixed(2)}</strong></div>
                      <div className="flex justify-between"><span>Fee:</span><strong>₹{Number(bet.fee).toFixed(2)}</strong></div>
                      {bet.state !== "pending" && (
                        <div className="flex justify-between">
                          <span>Result Number:</span>
                          <strong className="text-gray-800 font-black">{bet.resultNumber != null ? bet.resultNumber : "—"}</strong>
                        </div>
                      )}
                      <div className="flex justify-between"><span>Time:</span><span>{dateStr}</span></div>
                    </div>
                  )}
                </div>
              );
            })}
            {myBetsForDuration.length === 0 && (
              <div className="py-8 text-center text-gray-400 text-xs">
                No betting records found
              </div>
            )}

            {Math.ceil(myBetsForDuration.length / 10) > 1 && (
              <div className="flex items-center justify-center gap-4 py-2 mt-2 select-none">
                <button
                  type="button"
                  className="p-1 px-2.5 bg-white border border-gray-200 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                  disabled={gameHistoryPage === 1}
                  onClick={() => setGameHistoryPage((p) => p - 1)}
                >
                  <ArrowLeft size={14} />
                </button>
                <span className="text-xs font-bold text-gray-600">
                  {gameHistoryPage} / {Math.ceil(myBetsForDuration.length / 10)}
                </span>
                <button
                  type="button"
                  className="p-1 px-2.5 bg-white border border-gray-200 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                  disabled={gameHistoryPage === Math.ceil(myBetsForDuration.length / 10)}
                  onClick={() => setGameHistoryPage((p) => p + 1)}
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Slide-Up Betting Dialog Ticket */}
      {betSheet && (
        <div className="wg-sheet-mask" onClick={() => setBetSheet(null)}>
          <div className="wg-sheet" onClick={(e) => e.stopPropagation()}>
            <div className={`wg-sheet-header ${betTheme}`}>
              <h3>Join {getBetSelectionLabel(betSheet.betType, betSheet.betValue)}</h3>
            </div>

            <div className="wg-sheet-body">
              <div className="wg-sheet-row">
                <span>Contract Money</span>
                <div className="wg-sheet-contract-row">
                  {[1, 10, 100, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className={`wg-sheet-contract-btn ${baseAmount === amt ? "active" : ""}`}
                      onClick={() => setBaseAmount(amt)}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="wg-sheet-row">
                <span>Number</span>
                <div className="wg-sheet-qty-row">
                  <button type="button" className="wg-sheet-qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                    -
                  </button>
                  <input
                    type="number"
                    className="wg-sheet-qty-input"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button type="button" className="wg-sheet-qty-btn" onClick={() => setQuantity((q) => q + 1)}>
                    +
                  </button>
                </div>
              </div>

              <div className="wg-sheet-row wg-sheet-multi-shortcuts">
                <span>Multiplier</span>
                <div className="wg-sheet-multi-row">
                  {[1, 5, 10, 20, 50, 100].map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`wg-sheet-multi-btn ${quantity === m ? "active" : ""}`}
                      onClick={() => setQuantity(m)}
                    >
                      X{m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="wg-sheet-total-wrap">
                <span className="wg-sheet-total-label">Total Contract Money:</span>
                <strong className={`wg-sheet-total-val text-${betTheme}`}>
                  ₹{totalAmount.toFixed(2)}
                </strong>
              </div>

              <label className="wg-sheet-agree select-none">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span>I agree to the <span className="wg-sheet-link" onClick={(e) => { e.stopPropagation(); openRules(); }}>Pre-sale Agreement</span></span>
              </label>
            </div>

            <div className="wg-sheet-footer">
              <button type="button" className="wg-sheet-btn-cancel" onClick={() => setBetSheet(null)}>
                Close
              </button>
              <button type="button" className={`wg-sheet-btn-submit bg-${betTheme}`} onClick={submitBet} disabled={loading}>
                {loading ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Rules Modal */}
      <PreSaleRulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />

      {/* Outcome popups */}
      <OutcomePopup popup={outcomePopup} onClose={() => setOutcomePopup(null)} />

      <ToastStack toasts={toasts} />
    </main>
  );
}
