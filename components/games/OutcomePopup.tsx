"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

interface OutcomePopupProps {
  show: boolean;
  onClose: () => void;
  type: "win" | "lose";
  amount: number;
  gameName: string;
  periodId: string;
  resultDetails: React.ReactNode;
  balance: number;
  autoCloseSeconds?: number;
}

/** Smoothly counts a number up to `target` when `active`; otherwise shows it as-is. */
function useCountUp(target: number, active: boolean, duration = 1, startVal?: number) {
  const start = startVal !== undefined ? startVal : (active ? 0 : target);
  const [val, setVal] = useState(start);
  useEffect(() => {
    if (!active) return;
    // setState happens inside framer-motion's onUpdate callback (a subscription),
    // not synchronously in the effect body — so no cascading renders.
    const controls = animate(start, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [target, active, duration, start]);
  return active ? val : target;
}

const inr = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function OutcomePopup({
  show,
  onClose,
  type,
  amount,
  gameName,
  periodId,
  resultDetails,
  balance,
  autoCloseSeconds = 3,
}: OutcomePopupProps) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (show) {
      onCloseRef.current();
    }
  }, [show]);

  return null;
}

