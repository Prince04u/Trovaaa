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
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white border-t border-[#dddddd] h-[64px] grid grid-cols-3 select-none">
      {NAV_ITEMS.map(({ href, label, Icon, match }) => {
        const active = isActive(match, href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-[2px] text-decoration-none select-none transition-colors ${
              active ? "text-[#00A091]" : "text-[#808080]"
            }`}
          >
            <Icon size={22} strokeWidth={1.5} />
            <span className="text-[12px] font-normal leading-none">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
