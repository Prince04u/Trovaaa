"use client";

import { useEffect } from "react";

export default function AdminResultsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If the error is a redirect, handle it manually
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      const parts = error.digest.split(";");
      const url = parts[2]; // e.g. "/login"
      if (url) {
        window.location.href = url;
        return;
      }
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted">
        {error.digest?.startsWith("NEXT_REDIRECT")
          ? "Redirecting to login..."
          : error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-lg bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 transition"
      >
        Try again
      </button>
    </div>
  );
}
