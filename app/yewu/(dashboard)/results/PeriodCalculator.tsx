"use client";

import React, { useState, useMemo } from "react";
import { Search, Clock, Calendar, Check, AlertCircle } from "lucide-react";
import { getRoundNumber, getRoundWindow } from "@/lib/wingo/rounds";
import type { WingoMode } from "@/generated/prisma/client";
import { format } from "date-fns";

const MODES: { value: WingoMode; label: string }[] = [
  { value: "S30", label: "30 Seconds" },
  { value: "M1", label: "1 Minute" },
  { value: "M3", label: "3 Minutes (Sapre)" },
  { value: "M5", label: "5 Minutes (Emerd)" },
  { value: "PARITY", label: "Parity (3 Min)" },
  { value: "BCONE", label: "Bcone (3 Min)" },
];

export const formatPeriodId = (id: string | bigint | number): string => {
  if (!id) return "";
  const str = String(id);
  if (str.length > 11) return str.substring(0, 8) + str.substring(str.length - 3);
  return str;
};

export const expandPeriodId = (id: string, mode: WingoMode): string => {
  const clean = id.trim().replace(/\D/g, "");
  if (clean.length === 11) {
    try {
      const currentRound = getRoundNumber(mode);
      for (let offset = -1000; offset <= 1000; offset++) {
        const candidate = currentRound + BigInt(offset);
        const candidateStr = String(candidate);
        const formatted = candidateStr.substring(0, 8) + candidateStr.substring(candidateStr.length - 3);
        if (formatted === clean) {
          return String(candidate);
        }
      }
    } catch (e) {}
  }
  return clean;
};

export function PeriodCalculator() {
  const [selectedMode, setSelectedMode] = useState<WingoMode>("M1");
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [selectedTime, setSelectedTime] = useState<string>("17:00");
  const [searchPeriod, setSearchPeriod] = useState<string>("");

  // Calculate single period for selected date & time
  const calculatedPeriod = useMemo(() => {
    try {
      const [year, month, day] = selectedDate.split("-").map(Number);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const localDate = new Date(year, month - 1, day, hours, minutes, 0);
      const timestamp = localDate.getTime();
      if (isNaN(timestamp)) return null;

      const roundNumber = getRoundNumber(selectedMode, timestamp);
      const window = getRoundWindow(selectedMode, roundNumber);

      return {
        periodId: formatPeriodId(roundNumber),
        startsAt: new Date(window.startsAt),
        endsAt: new Date(window.endsAt),
        locksAt: new Date(window.locksAt),
      };
    } catch (e) {
      return null;
    }
  }, [selectedMode, selectedDate, selectedTime]);

  // Calculate all periods for the selected hour
  const hourlyPeriods = useMemo(() => {
    try {
      const periods: { periodId: string; startsAt: Date; endsAt: Date }[] = [];
      const [year, month, day] = selectedDate.split("-").map(Number);
      const hours = Number(selectedTime.split(":")[0]);
      const localDate = new Date(year, month - 1, day, hours, 0, 0);
      const baseTimestamp = localDate.getTime();
      if (isNaN(baseTimestamp)) return [];

      const modeDurationSeconds = selectedMode === "S30" ? 30 : selectedMode === "M1" ? 60 : selectedMode === "M5" ? 300 : 180;
      const durationMs = modeDurationSeconds * 1000;

      // Generate for one hour (3600 seconds)
      const count = 3600 / modeDurationSeconds;
      for (let i = 0; i < count; i++) {
        const timestamp = baseTimestamp + i * durationMs;
        const roundNum = getRoundNumber(selectedMode, timestamp);
        const window = getRoundWindow(selectedMode, roundNum);
        periods.push({
          periodId: formatPeriodId(roundNum),
          startsAt: new Date(window.startsAt),
          endsAt: new Date(window.endsAt),
        });
      }
      return periods;
    } catch (e) {
      return [];
    }
  }, [selectedMode, selectedDate, selectedTime]);

  // Search details of a specific Period ID
  const searchResult = useMemo(() => {
    if (!searchPeriod.trim()) return null;
    try {
      const cleanVal = searchPeriod.trim().replace(/\D/g, "");
      if (cleanVal.length < 5) return { error: "Please enter a valid period number" };

      const expandedVal = expandPeriodId(cleanVal, selectedMode);
      const roundNum = BigInt(expandedVal);
      const window = getRoundWindow(selectedMode, roundNum);

      return {
        periodId: formatPeriodId(roundNum),
        startsAt: new Date(window.startsAt),
        endsAt: new Date(window.endsAt),
        locksAt: new Date(window.locksAt),
      };
    } catch (e) {
      return { error: "Invalid Period ID or out of range" };
    }
  }, [searchPeriod, selectedMode]);

  return (
    <div className="grid lg:grid-cols-12 gap-6 mt-6">
      {/* Lookup Form panel */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <section className="card-surface rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-white/10 to-white/5 shadow-xl">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-400" />
            Period Time Calculator
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-muted block mb-1">Game Mode</label>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value as WingoMode)}
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none"
              >
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted block mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Time (Hour/Minute)</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>

            {calculatedPeriod && (
              <div className="mt-4 p-4 rounded-xl bg-teal-950/10 border border-teal-500/20">
                <p className="text-xs text-teal-400/80 uppercase font-semibold tracking-wider">Calculated Period</p>
                <p className="text-xl font-bold text-teal-400 mt-1 select-all">{calculatedPeriod.periodId}</p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs divide-x divide-border">
                  <div>
                    <span className="text-muted block">Starts:</span>
                    <span className="font-medium text-foreground">{format(calculatedPeriod.startsAt, "yyyy-MM-dd HH:mm:ss")}</span>
                  </div>
                  <div className="pl-2">
                    <span className="text-muted block">Ends:</span>
                    <span className="font-medium text-foreground">{format(calculatedPeriod.endsAt, "yyyy-MM-dd HH:mm:ss")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Period search override lookups */}
        <section className="card-surface rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-white/10 to-white/5 shadow-xl">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-gold" />
            Reverse Period Lookup
          </h2>
          <p className="text-xs text-muted mb-4">Enter a Wingo Period ID to find its exact start and end times.</p>

          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Period ID (e.g. 2026111000100001)"
                value={searchPeriod}
                onChange={(e) => setSearchPeriod(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none"
              />
              <Search className="w-4 h-4 text-muted absolute left-3 top-3" />
            </div>

            {searchResult && ("error" in searchResult ? (
              <div className="p-3 rounded-xl bg-red-950/10 border border-red-500/20 text-xs text-red flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchResult.error}</span>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gold/5 border border-gold/20">
                <p className="text-xs text-gold uppercase font-semibold tracking-wider">Lookup Result ({selectedMode})</p>
                <p className="text-lg font-bold text-gold mt-1">{searchResult.periodId}</p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs divide-x divide-border">
                  <div>
                    <span className="text-muted block">Starts At:</span>
                    <span className="font-medium text-foreground">{format(searchResult.startsAt, "yyyy-MM-dd HH:mm:ss")}</span>
                  </div>
                  <div className="pl-2">
                    <span className="text-muted block">Ends At:</span>
                    <span className="font-medium text-foreground">{format(searchResult.endsAt, "yyyy-MM-dd HH:mm:ss")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Hourly table panel */}
      <div className="lg:col-span-7">
        <section className="card-surface rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-white/10 to-white/5 shadow-xl flex flex-col h-[540px]">
          <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Rounds Schedule for {selectedTime.split(":")[0]}:00 - {selectedTime.split(":")[0]}:59
          </h2>
          <p className="text-xs text-muted mb-4">Complete schedule of Wingo period numbers active during this hour.</p>

          <div className="flex-1 overflow-y-auto border border-border rounded-xl">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-surface-2 border-b border-border text-left">
                  <th className="py-2.5 px-4 font-semibold text-xs text-muted uppercase">Period ID</th>
                  <th className="py-2.5 px-4 font-semibold text-xs text-muted uppercase">Start Time</th>
                  <th className="py-2.5 px-4 font-semibold text-xs text-muted uppercase">End Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {hourlyPeriods.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-muted">
                      No periods calculated for this hour. Check time input format.
                    </td>
                  </tr>
                ) : (
                  hourlyPeriods.map((p) => {
                    const isCurrent = calculatedPeriod?.periodId === p.periodId;
                    return (
                      <tr 
                        key={p.periodId} 
                        className={`hover:bg-white/5 transition-colors ${
                          isCurrent ? "bg-teal-500/5 font-semibold text-teal-400" : ""
                        }`}
                      >
                        <td className="py-2.5 px-4 select-all flex items-center gap-2">
                          {p.periodId}
                          {isCurrent && <Check className="w-3.5 h-3.5" />}
                        </td>
                        <td className="py-2.5 px-4 text-muted">{format(p.startsAt, "HH:mm:ss")}</td>
                        <td className="py-2.5 px-4 text-muted">{format(p.endsAt, "HH:mm:ss")}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
