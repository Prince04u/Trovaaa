"use client";

import { PlatformStatusProvider } from "@/components/platform/PlatformStatusProvider";

export default function PlatformRoot({ children }) {
  return <PlatformStatusProvider>{children}</PlatformStatusProvider>;
}


