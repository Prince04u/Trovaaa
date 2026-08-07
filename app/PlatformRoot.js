"use client";

import { useEffect } from "react";
import { PlatformStatusProvider } from "@/components/platform/PlatformStatusProvider";

export default function PlatformRoot({ children }) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        window.location.reload();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <PlatformStatusProvider>
      {children}
    </PlatformStatusProvider>
  );
}
