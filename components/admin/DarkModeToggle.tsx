"use client";

import { useState, useEffect } from "react";

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    } else {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      }
    }
  }, []);

  const toggle = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="p-1.5 rounded-md hover:bg-surface-3 transition flex items-center justify-center text-muted shrink-0"
      title="Toggle Dark Mode"
    >
      {isDark ? (
        <span className="material-icons-outlined text-[20px]">light_mode</span>
      ) : (
        <span className="material-icons-outlined text-[20px]">dark_mode</span>
      )}
    </button>
  );
}
