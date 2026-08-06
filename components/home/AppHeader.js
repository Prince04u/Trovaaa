"use client";

import Link from "next/link";
import { ArrowDownToLine } from "lucide-react";

export default function AppHeader() {
  return (
    <header className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 h-14 sticky top-0 z-40">
      {/* Brand Logo & Name */}
      <Link href="/" className="flex items-center gap-2 text-decoration-none">
        <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full object-cover shadow-sm" />
        <span className="text-[17px] font-black text-[#222222] tracking-tight">
          Luvomall
        </span>
      </Link>

      {/* App Promotion & Download */}
      <Link 
        href="/support" 
        className="flex items-center gap-2 text-[#666666] hover:text-[#009688] transition-colors"
      >
        <span className="text-[13px] font-medium text-gray-500 hidden xs:inline">
          Open with an app
        </span>
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#009688] hover:text-white transition-colors cursor-pointer">
          <ArrowDownToLine size={16} />
        </div>
      </Link>
    </header>
  );
}
