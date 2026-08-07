"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingDialog from "@/components/auth/LoadingDialog";
import { Trophy, ArrowLeft, ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
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
          } else {
            newPeriod = { ...parsed, remainingSeconds: 0 };
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
  const [showBetLoading, setShowBetLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPurpleLine, setShowPurpleLine] = useState(true);
  const [gameHistoryPage, setGameHistoryPage] = useState(1);
  const [myBetsPage, setMyBetsPage] = useState(1);
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
    const showSpinner = opts?.showSpinner === true;
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
    if (!isAuthInitialized) {
      if (!getToken()) {
        router.replace("/login");
        setIsAuthInitialized(true);
        return;
      }
      setIsAuthInitialized(true);
      loadData({ showSpinner: true });
    }
    
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

  const autoReloadTimerRef = useRef(null);

  const handleContinue = () => {
    if (autoReloadTimerRef.current) {
      clearTimeout(autoReloadTimerRef.current);
    }
    setRefreshing(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }, 150);
  };

  const reloadInitiatedRef = useRef(false);

  useEffect(() => {
    if (period && remainingSeconds === 0 && !reloadInitiatedRef.current) {
      reloadInitiatedRef.current = true;
      setRefreshing(true);
      const timer = setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }, 1500);
      return () => clearTimeout(timer);
    } else if (remainingSeconds > 0) {
      reloadInitiatedRef.current = false;
    }
  }, [remainingSeconds, period]);

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
    if (totalAmount < 10) {
      push("Minimum bet amount is ₹10", "error");
      return;
    }
    if (totalAmount < betLimits.minBetAmount || totalAmount > betLimits.maxBetAmount) {
      push(`Bet amount must be between ₹${betLimits.minBetAmount} and ₹${betLimits.maxBetAmount.toLocaleString("en-IN")}`, "error");
      return;
    }
    if (balance < totalAmount) {
      push("Your balance is insufficient", "error");
      return;
    }
    
    setLoading(true);
    const deductedAmount = totalAmount;
    setBalance(prev => prev - deductedAmount);
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

      setLoading(false);
      setBetSheet(null);

      setTimeout(() => {
        push("success", "success");
        setShowBetLoading(true);

        loadData({ showSpinner: false })
          .then(() => {
            setShowBetLoading(false);
          })
          .catch(() => {
            setShowBetLoading(false);
          });
      }, 1000);
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
    if (msg.includes("Insufficient balance") || msg.includes("insufficient_balance")) {
      return "Your balance is insufficient";
    }
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

  

  return (
    <main className="wingo-game">
      <div className="win">
        <div className="mine_top">
            <div className="mine_info" style={{ WebkitTapHighlightColor: "transparent", padding: "12px 8px 8px", background: "#009688" }}>
              <p className="balance" style={{ fontSize: "18px", padding: "12px 8px 15px", color: "#FFFFFF", margin: 0 }}>
                Available balance: ₹ {Number(balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="mine_info_btn" style={{ WebkitTapHighlightColor: "transparent" }}>
                <div className="btn_group" style={{ display: 'flex', gap: '0' }}>
                  <button type="button" className="one_btn ripple bg-[#2196f3] text-white rounded-[2px]" style={{ WebkitTapHighlightColor: "transparent", fontSize: "14px", fontWeight: "400", padding: "0 15px", display: "flex", alignItems: "center", justifyContent: "center", height: "36px", boxSizing: "border-box", border: "none", outline: "none", cursor: "pointer", marginRight: "10px" }} onClick={() => router.push("/recharge")}>Recharge</button>
                  <button type="button" className="bg-[#f5f5f5] text-[rgba(0,0,0,0.87)] rounded-[2px]" style={{ WebkitTapHighlightColor: "transparent", fontSize: "14px", fontWeight: "400", padding: "0 15px", display: "flex", alignItems: "center", justifyContent: "center", height: "36px", boxSizing: "border-box", border: "none", outline: "none", cursor: "pointer" }} onClick={() => router.push(`/trend?type=${duration}`)}>Trend</button>
                </div>
                <div className="refresh" onClick={() => loadData({ showSpinner: true })} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <img src="/apex_refresh.png" alt="Refresh" style={{ width: '22px', height: '22px' }} />
                </div>
            </div>
          </div>
        </div>

        {/* Game Mode Title (e.g. Parity) */}
        <div className="flex items-center justify-center bg-white py-[12px] text-[15px] font-normal text-[#333] select-none border-b-[2px] border-[#009688]">
          {duration === 'bcone' || duration === 'parity' ? 'Parity' : duration.charAt(0).toUpperCase() + duration.slice(1)}
        </div>

        {/* Period & Count Down Card */}
        <div className="center_text select-none">
          <ul className="center_top">
            <li>
              <ul className="top_ol">
                <img src="/apex_trophy.png" alt="Trophy" className="inline-block mr-[10px] align-middle" style={{ width: '20px', height: '20px', opacity: 0.7 }} />
                <span>Period</span>
              </ul>
              <ul className="bot_ol">
                <span className="period-id">{period?.periodId ? formatPeriodId(period.periodId) : "—"}</span>
              </ul>
            </li>
            <li className="right_li">
              <ul className="top_ol">Count Down</ul>
              <ul className="bot_ol">
                {remainingSeconds > 0 ? (
                  <div className="countdown">
                    <div className="van-count-down">
                      <span className="span">{timer.mm[0]}</span>
                      <span className="span">{timer.mm[1]}</span>
                      <span className="colon">:</span>
                      <span className="span">{timer.ss[0]}</span>
                      <span className="span">{timer.ss[1]}</span>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handleContinue} 
                    style={{
                      backgroundColor: "#ff9800",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 14px",
                      fontSize: "14px",
                      fontWeight: "normal",
                      cursor: "pointer",
                      display: "inline-block",
                      outline: "none",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
                    }}
                  >
                    Continue
                  </button>
                )}
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
            <div className="content_title flex flex-col items-center justify-center py-[12px] bg-white text-[#666] text-[14px]">
              <img src="/apex_trophy.png" alt="Trophy" className="inline-block mb-1" style={{ width: '24px', height: '24px', opacity: 0.7 }} />
              <span className="font-light">{duration === 'bcone' || duration === 'parity' ? 'Parity Record' : duration.charAt(0).toUpperCase() + duration.slice(1) + ' Record'}</span>
            </div>
            <div className="h-[1px] w-full bg-[#009688]" />
            
            <ul className="list_head">
              <li>Period</li>
              <li>Price</li>
              <li>Number</li>
              <li>Result</li>
            </ul>
            <div className="w-full h-[3px] bg-transparent relative overflow-hidden" style={{ minHeight: '3px' }}>
              {refreshing && showPurpleLine && (
                <>
                  <style>{`
                    @keyframes indeterminateProgress {
                      0% { left: -50%; width: 50%; }
                      50% { left: 25%; width: 60%; }
                      100% { left: 100%; width: 50%; }
                    }
                    .purple-progress-bar {
                      animation: indeterminateProgress 1.3s infinite linear;
                    }
                  `}</style>
                  <div className="absolute top-0 bottom-0 bg-[#9c27b0] purple-progress-bar" />
                </>
              )}
            </div>
            
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
          <div className="flex items-center justify-center relative py-4 bg-white text-[13.5px] text-[#888] select-none border-b border-gray-100">
            <span>
              {(gameHistoryPage - 1) * 10 + 1}-{Math.min(gameHistoryPage * 10, results.length)} of {results.length}
            </span>
            <div className="absolute right-6 flex items-center gap-8">
              <button
                type="button"
                className="disabled:opacity-30 cursor-pointer bg-transparent border-none outline-none text-[#888] flex items-center justify-center"
                disabled={gameHistoryPage === 1}
                onClick={() => setGameHistoryPage((p) => p - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="disabled:opacity-30 cursor-pointer bg-transparent border-none outline-none text-[#888] flex items-center justify-center"
                disabled={gameHistoryPage === gameHistoryPageCount}
                onClick={() => setGameHistoryPage((p) => p + 1)}
              >
                <ChevronRight size={18} />
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
            {myBetsForDuration.slice((myBetsPage - 1) * 10, myBetsPage * 10).map((bet) => {
              const id = bet._id || bet.id;
              const isExpanded = expandedBetId === id;
              const stateText = bet.state === "pending" ? "Wait" : bet.state === "won" ? "Success" : "Fail";
              const stateColor = bet.state === "won" ? "text-[#4caf50]" : bet.state === "pending" ? "text-[#ff9800]" : "text-[#f44336]";

              // Dynamic calculations requested by user:
              // Fee is 5% of amount
              const feeVal = Number(bet.amount || 0) * 0.05;
              // Delivery is amount - fee
              const deliveryVal = Number(bet.amount || 0) - feeVal;
              
              // WinAmount multipliers: 8.6x for number, 4.5x for violet, 1.425x for partial color win, 1.9x for big/small/color
              let calculatedWinAmount = deliveryVal * 2; 
              const typeUpper = String(bet.betType || "").toUpperCase();
              const valueUpper = String(bet.betValue || "").toUpperCase();
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

              // In amount: if won, show "+ <winAmount>"; if lost, show "- <amount>"; if wait, show ""
              const amountStr = bet.state === "pending" 
                ? "" 
                : bet.state === "won" 
                ? `+${Number(calculatedWinAmount).toFixed(2)}` 
                : `-${Number(deliveryVal).toFixed(2)}`;

              const displayPeriodId = formatPeriodId(bet.periodId);
              
              // Open price helper: random-looking deterministic open price between 4400 and 4900
              const getDeterministicOpenPrice = (pId) => {
                if (!pId) return 4500;
                let hash = 0;
                const str = String(pId);
                for (let i = 0; i < str.length; i++) {
                  hash = str.charCodeAt(i) + ((hash << 5) - hash);
                }
                const min = 4400;
                const max = 4900;
                return min + (Math.abs(hash) % (max - min + 1));
              };
              const openPrice = getDeterministicOpenPrice(bet.periodId);

              // Date formatter helper for Create Time
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

              const selectDisplay = getBetSelectionLabel(bet.betType, bet.betValue);
              const hasResult = bet.state !== "pending" && bet.resultNumber != null;
              
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
                        <span>{contractMoney}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Contract Count</span>
                        <span>{contractCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Delivery</span>
                        <span className="text-[#ff9800]">{Number(deliveryVal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Fee</span>
                        <span>{Number(feeVal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Open Price</span>
                        <span>{openPrice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Result</span>
                        {hasResult ? (
                          <div className="flex items-center gap-1">
                            <span className="font-bold mr-1">{bet.resultNumber}</span>
                            {bet.resultColors?.map((c) => (
                              <span key={c} style={{ color: c === "green" ? "#4caf50" : c === "red" ? "#f44336" : "#8e24aa", fontWeight: "bold", marginRight: "4px" }}>
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Select</span>
                        <span className="text-[#2196f3]">{selectDisplay}</span>
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
                        <span>{formatCreateTime(bet.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#333]">Type</span>
                        <span>Parity</span>
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

            {(() => {
              const myBetsPageCount = Math.ceil(myBetsForDuration.length / 10);
              const startIdx = (myBetsPage - 1) * 10;
              const endIdx = myBetsPage * 10;
              const hasRecords = myBetsForDuration.length > 0;
              
              return (
                <>
                  {hasRecords && (
                    <div className="flex items-center justify-center relative py-4 bg-white text-[13.5px] text-[#888] select-none border-b border-gray-100">
                      <span>
                        {startIdx + 1}-{Math.min(endIdx, myBetsForDuration.length)} of {myBetsForDuration.length}
                      </span>
                      <div className="absolute right-6 flex items-center gap-8">
                        <button
                          type="button"
                          className="disabled:opacity-30 cursor-pointer bg-transparent border-none outline-none text-[#888] flex items-center justify-center"
                          disabled={myBetsPage === 1}
                          onClick={() => setMyBetsPage((p) => p - 1)}
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          className="disabled:opacity-30 cursor-pointer bg-transparent border-none outline-none text-[#888] flex items-center justify-center"
                          disabled={myBetsPage === myBetsPageCount || myBetsPageCount <= 1}
                          onClick={() => setMyBetsPage((p) => p + 1)}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center bg-white pb-6 pt-4" style={{ boxShadow: '0 -2px 10px rgba(0,0,0,0.04)' }}>
                    <button 
                      onClick={() => router.push("/orders")}
                      className="bg-[#2196f3] text-white px-8 py-2 rounded-[4px] shadow-[0_2px_5px_rgba(33,150,243,0.3)] text-[14px] font-medium border-none outline-none cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                    >
                      My Orders
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Slide-Up Betting Dialog Ticket */}
      {betSheet && (
        <div 
          className="fixed inset-0 z-[200] bg-black/45 flex items-center justify-center select-none p-4" 
          onClick={() => setBetSheet(null)}
        >
          <div 
            className="bg-white w-[90%] max-w-[340px] rounded-[12px] overflow-hidden shadow-2xl relative pb-0 transition-all duration-300 transform translate-y-0" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`wg-sheet-header ${betTheme}`}>
              <h3 style={{ margin: 0, padding: 0 }}>Join {getBetSelectionLabel(betSheet.betType, betSheet.betValue)}</h3>
            </div>

            <div className="wg-sheet-body">
              <div className="wg-sheet-row">
                <span>Contract Money</span>
                <div className="wg-sheet-contract-row">
                  {[10, 100, 1000, 10000].map((amt) => (
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

              <div className="wg-sheet-total-wrap" style={{ marginTop: '20px', marginBottom: '15px' }}>
                <span className="wg-sheet-total-label" style={{ fontSize: '14px', color: '#333' }}>Total contract money is {totalAmount}</span>
              </div>

              <label className="wg-sheet-agree select-none" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                <div 
                  style={{
                    width: '18px', 
                    height: '18px', 
                    background: agreed ? '#000' : '#fff',
                    border: agreed ? '1px solid #000' : '1px solid #ccc',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '8px'
                  }}
                  onClick={() => setAgreed(!agreed)}
                >
                  {agreed && <span className="material-icons-outlined" style={{ color: '#fff', fontSize: '14px' }}>check</span>}
                </div>
                <span>I agree <span className="wg-sheet-link" style={{ color: '#009688' }} onClick={(e) => { e.stopPropagation(); openRules(); }}>PRESALE RULE</span></span>
              </label>
            </div>

            <div className="wg-sheet-footer">
              <button type="button" className="wg-sheet-btn-cancel" onClick={() => setBetSheet(null)}>
                CANCEL
              </button>
              <button type="button" className="wg-sheet-btn-submit" style={{ color: '#009688' }} onClick={submitBet} disabled={loading}>
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Rules Modal */}
      <PreSaleRulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />

      {/* Outcome popups */}
      {outcomePopup && (
        <OutcomePopup
          show={true}
          onClose={() => setOutcomePopup(null)}
          type={outcomePopup.type}
          amount={outcomePopup.amount}
          gameName="Wingo"
          periodId={outcomePopup.periodId}
          balance={balance}
          resultDetails={
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {outcomePopup.resultColors?.map((c, i) => (
                <span key={i} className={`wg-result-dot ${c.toLowerCase()}`} style={{ width: "16px", height: "16px", borderRadius: "50%", display: "inline-block" }} />
              ))}
              {outcomePopup.resultNumber != null && (
                <span style={{ fontWeight: "bold", fontSize: "14px", color: "#FFE9A8", marginLeft: "4px" }}>
                  {outcomePopup.resultNumber}
                </span>
              )}
              {outcomePopup.size && (
                <span style={{ fontSize: "12px", color: "#ccc", marginLeft: "4px" }}>
                  ({outcomePopup.size})
                </span>
              )}
            </div>
          }
        />
      )}

      <LoadingDialog visible={showBetLoading || refreshing} />
      <ToastStack toasts={toasts} />
    </main>
  );
}

