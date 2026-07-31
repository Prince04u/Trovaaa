"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: Home, match: "home" },
  { href: "/games", label: "Search", Icon: Search, match: "search" },
  { href: "/account", label: "My", Icon: User, match: "my" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (match, href) => {
    if (match === "home") return pathname === "/";
    if (match === "search") return pathname === "/games" || pathname.startsWith("/games/");
    if (match === "my") return pathname.startsWith("/account") || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/wallet") || pathname.startsWith("/referral");
    return pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white border-t border-[#EEEEEE] shadow-[0_-2px_8px_rgba(0,0,0,0.04)] h-[52px] md:h-[56px] grid grid-cols-3 select-none">
      {NAV_ITEMS.map(({ href, label, Icon, match }) => {
        const active = isActive(match, href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-1 text-decoration-none select-none transition-colors ${
              active ? "text-[#009688]" : "text-[#757575]"
            }`}
          >
            <Icon size={20} strokeWidth={1.75} />
            <span className="text-[11px] md:text-[12px] font-normal leading-none">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
