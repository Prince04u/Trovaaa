
"use client";

import { useCallback, useRef, useState } from "react";
import clsx from "clsx";

export type ToastItem = { id: number; message: string; type: "success" | "error" };

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const push = useCallback((message: string, type: ToastItem["type"] = "success", duration: number = 2000) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, duration);
  }, []);

  return { toasts, push };
}

export function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col items-center justify-center gap-2">
      <style>{`
        @keyframes wgToastIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-[rgba(0,0,0,0.7)] text-white px-8 py-3 rounded-[4px] text-[15px] font-normal"
          style={{
            animation: "wgToastIn 0.15s ease-out forwards",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

