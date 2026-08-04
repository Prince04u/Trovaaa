"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
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
export const formatPeriodId = (id) => {
  if (!id) return "";
  const str = String(id);
  if (str.length > 11) return str.substring(0, 8) + str.substring(str.length - 3);
  return str;
};

export default function WingoGameScreen({ duration: propDuration, initialPeriod = null, initialResults = [] }) {
  const params = useParams();
  const router = useRouter();
  const duration = propDuration || params.duration || "parity";
  const { maintenanceMode, blocksAction } = usePlatformStatus();
  const { push, toasts } = useToasts();

  // Seeded from the last known balance in localStorage so the wallet card
  // never flashes ₹0.00 while the client's own fetch is still in flight.
  // never flashes ₹0.00 while the client's own fetch is in flight.
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
  const bettingLocked = (remainingSeconds > 0 && remainingSeconds <= 30) || loading || maintenanceMode || blocksAction("bet");
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

  const loadData = useCallback(async (opts = {}) => {
    const showSpinner = opts?.showSpinner ?? true;
    if (showSpinner) setRefreshing(true);
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
      if (showSpinner) setRefreshing(false);
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
        
        loadData({ showSpinner: false });

        clearInterval(pollTimerRef.current);
        pollTimerRef.current = setInterval(async () => {
          try {
            const resultsRes = await getRecentResults(duration, 50);
            const latest = resultsRes.data || [];
            const isSettled = latest.some(r => String(r.periodId) === String(endedPeriodId));
            if (isSettled) {
              clearInterval(pollTimerRef.current);
              loadData({ showSpinner: false });
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
    const refreshInterval = setInterval(() => { loadData({ showSpinner: false }); }, 4000);
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
      <div className="win">
        <div className="mine_top">
            <div className="mine_info" style={{ WebkitTapHighlightColor: "transparent", display: "flex", flexDirection: "column", padding: "0", overflow: "hidden" }}>
              <div className="balance" style={{ padding: "12px 15px", boxSizing: "border-box", width: "100%" }}>
                Available balance: ₹ {Number(balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mine_info_btn" style={{ WebkitTapHighlightColor: "transparent", background: "rgba(0, 0, 0, 0.05)", padding: "10px 15px", width: "100%", boxSizing: "border-box", display: "flex", justifyContent: "space-between" }}>
                <div className="btn" style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="bg-white text-[#333] rounded-[2px]" style={{ WebkitTapHighlightColor: "transparent", fontSize: "14px", fontWeight: "400", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "center", height: "30px", boxSizing: "border-box", border: "none", outline: "none", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} onClick={() => router.push("/wallet/deposit")}>Recharge</button>
                  <button type="button" className="bg-white text-[#333] rounded-[2px]" style={{ WebkitTapHighlightColor: "transparent", fontSize: "14px", fontWeight: "400", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "center", height: "30px", boxSizing: "border-box", border: "none", outline: "none", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} onClick={() => setHistoryTab("chart")}>Trend</button>
                </div>
                <div className="refresh" onClick={loadData} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={refreshing ? "animate-spin text-white" : "text-white"}
                  style={{ width: "22px", height: "22px" }}
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="main">
          <ul className="main_nav">
            <li className="active text-center">{duration.charAt(0).toUpperCase() + duration.slice(1)}</li>
          </ul>
        </div>

        {/* Period & Count Down Card */}
        <div className="center_text select-none">
          <ul className="center_top">
            <li>
              <ul className="top_ol">
                <Trophy strokeWidth={2} />
                <span>Period</span>
              </ul>
              <ul className="bot_ol">
                <span className="period-id">{period?.periodId ? formatPeriodId(period.periodId) : "—"}</span>
              </ul>
            </li>
            <li className="right_li">
              <ul className="top_ol">Count Down</ul>
              <ul className="bot_ol">
                <div className="countdown">
                  <div className="van-count-down">
                    <span className="span">{timer.mm[0]}</span>
                    <span className="span">{timer.mm[1]}</span>
                    <span className="colon">:</span>
                    <span className="span">{timer.ss[0]}</span>
                    <span className="span">{timer.ss[1]}</span>
                  </div>
                </div>
              </ul>
            </li>
          </ul>

          <div className="btn_center">
            <button className="back_one" disabled={bettingLocked} onClick={() => openBetSheet("color", "green")}>Join Green</button>
            <button className="back_two" disabled={bettingLocked} onClick={() => openBetSheet("color", "violet")}>Join Violet</button>
            <button className="back_three" disabled={bettingLocked} onClick={() => openBetSheet("color", "red")}>Join Red</button>
          </div>

          <ul className="center_notes">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <li key={num}>
                <button type="button" disabled={bettingLocked} onClick={() => openBetSheet("number", num)}>
                  {num}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* History and Tabs lists */}
        <div className="content">
          <div className="content_con select-none">
            <div className="flex flex-col items-center justify-center pt-4 pb-2 bg-white text-[#666] text-[14px]">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAADF0lEQVRoQ+1aO2gUURQ9Nx8mYCfYiR+w0EbsTMD4qyVqwA/aGBG7FUdm3jYBYxOYeS+OmE6IBoL4Az9gk8L4BbVSUlkIiXY2dkKEZK9MSGR8O7PzdXeKmXLn3nvOub/d91hCwse2bU5oWqiZlJKSBExk5AeqhCRJZwubqiJRySl9a3WKYM6Oa3KnSkjRKc0Zr6pIzgQW7h5akbDd3alZSsqlElJ4b0QETFORTwD2BON0dXVtdRzne/CzsrRWvV7f0mg0vmm6P/utdQfAOU3IoOM470oqZF+j0XirCZn2hQgAjvbikZTyZBmF2Lb9EMAJjW+dhBBDzPxMb1EiOu+6rl+t1acMrSWEGGHm2yFcj66eRyzLek1E+zWDX8x8RCn1qgxCLMs6SETPAWwI8mTmN0qpA+tCjhPR45DFsUBEV1zXfdrJigghjjHzdQDbdY7MPKyUevL3hGjb9n0ApyK2oD9cg+1auRpOK+wHUsrTvv1fIUKIfmZ+3yGymWCJaMB13Q//CFmblb1EdAvA7kyR2+c0z8wXlVIf1yGbLh9M09zY09NzE8DZ9vFKhXR3eXn5kud5P4NekbcolmVdBXA4ZJulQi3K2N9OAOaUUtfCYsZeB5mmuaO7u/vQmqjVwWrXw8z+AppbWVl56Xne11a4sUKCzrZtLwDY1iYhi1LKpnUbhZ1KSNQ36/8Qpv+yiMNIJaRWqxl9fX1f2lCVxaWlpZ2Tk5O/4wREbq04R38JENFYnF2e98w8FjXUhbTWehAhhMfMl/OQjSREdMN1XTNt7FStpQ1+0zkmLXiI/bSUciRLnMxCfLCwQ1kWEr4PM08ppS5k9c8lxAe1LOsMEY0C2JWFBDPPMrM3MTExm8U/87CHgdVqtU2GYYwS0TCAzQkJvWDme0qpqYT2Lc1yVyQY3V/PhmEMEFE/gAEAQxr6PICZ3t7emfHx8R9FCCi0ImGEwtZ0lrWaVGyhFQmCVkKSlkCzqyoSl7iqteIyFPG+aq24xFWtFZehqrVaZKjoa9Skf9cIo5Rr2CshEVWuKhK8xM6yLMrUWn8AMZSO49QGBtUAAAAASUVORK5CYII=" width="24" height="24" className="mb-1 opacity-60" alt="Trophy" />
              <span className="font-light">{duration === 'bcone' ? 'Bcone Record' : duration === 'parity' ? 'Parity Record' : duration.charAt(0).toUpperCase() + duration.slice(1) + ' Record'}</span>
            </div>
            <div className="h-[1px] w-full bg-[#009688]" />
            
            <ul className="list_head">
              <li>Period</li>
              <li>Price</li>
              <li>Number</li>
              <li>Result</li>
            </ul>
            
            {displayResults.slice((gameHistoryPage - 1) * 10, gameHistoryPage * 10).map((r) => {
              const dots = r.resultColors?.length ? r.resultColors : getColorDots(r.resultNumber);
              const numberClass = r.resultNumber % 2 === 1 ? "green" : "red";
              
              return (
                <ul className="list_con" key={r.periodId}>
                  <li className="wg-period-cell">{formatPeriodId(r.displayPeriodId || r.periodId)}</li>
                  <li>{getPrice(r)}</li>
                  <li className={`wg-number-cell ${numberClass}`}>{r.resultNumber}</li>
                  <li>
                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                      {dots.map((color, idx) => (
                        <span key={idx} className={`wg-result-dot ${color.toLowerCase()}`} />
                      ))}
                    </div>
                  </li>
                </ul>
              );
            })}
            
            {results.length === 0 && (
              <div className="py-8 text-center text-gray-400">
                No history records found
              </div>
            )}
          </div>
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

        {historyTab === "chart" && (
          <div className="p-4 select-none bg-white">
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

        <div className="flex flex-col bg-[#f5f5f5] mt-2">
          <div className="flex flex-col items-center justify-center pt-4 pb-2 bg-white text-[#666] text-[14px]">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAB6ElEQVRoQ+2asUoDQRCGZyBPYKeV1r6EPoKgQsBGIYKN1Y1CGrU7bg4uYGvAxiCm8Q2Sh7ASCytLsRNygZGDPTkuF3PLJZtzs6nCMMPONzP7J3t7CJZ80BIOcCB16+TMjniet1OHpMMwHP6Vx1QQIroAgDMA2KwDiIi8AkAvDMObonwKQYioCwAndQAoyOGQmft5+wRIu91ej+P4o6YQSVrvzLw1EyTZE4g4SB1F5LoOUIj4m4eI7Ob3zERHikCmzaUpQM/zrhxIdrRcR+Y0e2608qpVNFqqSqcAMBiPx60oir6TBmTsG7oNEZFuo9Hwfd9/y8YutCNE9AIA22rBO2ZuJd9zdl2WxP+cmW9NgvQAoKkWPGbmewWStWuDIOJeEATPJkGaIrKPiMNsBYkota/pUiBifzQa9TqdzpcxEN0kq/gvdI9USUw31oGUkV/dqlbxdx0p05GMOs1VteI4foyi6NOYahHREwAcqAUvmTlQvyNZu/ZEIeJREAQPDiStQNmDlTWjpT0zFQKcapVRrQoF1g51HVmpjixKtYz/jSciaw5Wdhx1rXn4oK2hFQKc/K6U/FaYFO1QN1pWXPRYc/Wmjqv//zI03YlWXE/nDv7/+4UBbY1ccsDMVziWnF/p5R1I6VIZcvwBChr8Ue16BMAAAAAASUVORK5CYII=" width="24" height="24" className="mb-1 opacity-60" alt="My Record" />
            <span className="font-light">My Record</span>
          </div>
          <div className="h-[1px] w-full bg-[#009688]" />
          
          <div className="p-0 select-none flex flex-col bg-white">
            {myBetsForDuration.slice(0, 30).map((bet) => {
              const id = bet._id || bet.id;
              const isExpanded = expandedBetId === id;
              const dateStr = bet.createdAt ? new Date(bet.createdAt).toLocaleString("en-IN") : "";
              const stateText = bet.state === "pending" ? "Wait" : bet.state === "won" ? "Success" : "Fail";
              const stateColor = bet.state === "won" ? "text-[#4caf50]" : bet.state === "pending" ? "text-[#ff9800]" : "text-[#f44336]";
              const amountStr = bet.state === "pending" ? "" : bet.state === "won" ? `+${Number(bet.winAmount).toFixed(2)}` : `-${Number(bet.amount).toFixed(2)}`;
              const displayPeriodId = formatPeriodId(bet.periodId);
              
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
                    <div className="px-4 py-2 bg-white flex flex-col gap-3 text-[13px] text-[#333]">
                      <div className="font-medium text-[#009688] mb-1">Period Detail</div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Period</span>
                        <span>{displayPeriodId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Contract Money</span>
                        <span>10</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Contract Count</span>
                        <span>1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Delivery</span>
                        <span className="text-[#ff9800]">9.50</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Fee</span>
                        <span>0.50</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Open Price</span>
                        <span>44777</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Result</span>
                        <div>
                          <span className="text-[#2196f3] mr-1">7</span>
                          <span className="text-[#4caf50]">green</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Select</span>
                        <span className="text-[#2196f3]">5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Status</span>
                        <span className={stateColor}>{stateText}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Amount</span>
                        <span className={stateColor}>{amountStr}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Create Time</span>
                        <span>2026-04-20 20:05</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Type</span>
                        <span>Bcone</span>
                      </div>
                      <div className="flex justify-end mt-2 mb-2">
                        <button 
                          className="bg-[#009688] text-white px-3 py-1 text-[13px] rounded-sm border-none cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push("/product?id=1");
                          }}
                        >
                          Pre Pay
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {myBetsForDuration.length === 0 && (
              <div className="py-8 text-center text-gray-400 text-xs bg-white">
                No betting records found
              </div>
            )}

            <div className="flex items-center justify-between px-4 py-3 bg-white text-[13px] text-[#999]">
              <div>1-10 of {myBetsForDuration.length}</div>
              <div className="flex gap-4">
                <span className="material-icons-outlined text-[18px] text-[#ccc] cursor-pointer">keyboard_arrow_left</span>
                <span className="material-icons-outlined text-[18px] text-[#999] cursor-pointer">keyboard_arrow_right</span>
              </div>
            </div>
            
            <div className="flex justify-center bg-white pb-6 pt-2 border-t border-gray-100">
              <button 
                onClick={() => router.push("/orders")}
                className="bg-[#2196f3] text-white px-8 py-2 rounded-[2px] shadow-sm text-[14px] border-none outline-none cursor-pointer"
              >
                My Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-Up Betting Dialog Ticket */}
      {betSheet && (
        <div className="wg-sheet-mask select-none" onClick={() => setBetSheet(null)}>
          <div className="wg-sheet" onClick={(e) => e.stopPropagation()}>
            <div className={`wg-sheet-header ${betTheme}`}>
              <h3 style={{ margin: 0, padding: 0 }}>Join {getBetSelectionLabel(betSheet.betType, betSheet.betValue)}</h3>
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
