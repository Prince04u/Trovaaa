
"use client";

import { useCallback, useRef, useState } from "react";
import clsx from "clsx";

export type ToastItem = { id: number; message: string; type: "success" | "error" };

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const push = useCallback((message: string, type: ToastItem["type"] = "success", duration: number = 2000) => {
    const id = ++idRef.current;
    // Replace array instead of appending to prevent stacking
    setToasts([{ id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, duration);
  }, []);

  return { toasts, push };
}

export function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] flex flex-col items-center justify-center gap-2">
      <style>{`
        @keyframes wgToastIn {
          0% { transform: scale(0.8) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
      {toasts.map((t) => {
        const displayMsg = t.message?.toLowerCase() === "success" ? "success" : t.message;
        return (
          <div
            key={t.id}
            className="bg-[#4c4c4c]/95 text-white px-5 py-2 rounded-[8px] text-[13.5px] font-normal shadow-md shadow-black/10 text-center min-w-[110px] pointer-events-none select-none"
            style={{
              animation: "wgToastIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
            }}
          >
            {displayMsg}
          </div>
        );
      })}
    </div>
  );
}

