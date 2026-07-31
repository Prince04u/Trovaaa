"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ICONS } from "./NavIcons";

const NAV_ITEMS = [
  { href: "/", label: "Home", activeIcon: NAV_ICONS.homeActive, inactiveIcon: NAV_ICONS.homeInactive, match: "home" },
  { href: "/search", label: "Search", activeIcon: NAV_ICONS.searchActive, inactiveIcon: NAV_ICONS.searchInactive, match: "search" },
  { href: "/wingo/30s", label: "Win", activeIcon: NAV_ICONS.winActive, inactiveIcon: NAV_ICONS.winInactive, match: "win" },
  { href: "/account", label: "My", activeIcon: NAV_ICONS.myActive, inactiveIcon: NAV_ICONS.myInactive, match: "my" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (match, href) => {
    if (match === "home") return pathname === "/";
    if (match === "search") return pathname === "/search" || pathname === "/games" || pathname.startsWith("/games/");
    if (match === "win") return pathname.startsWith("/wingo") || pathname.startsWith("/dice") || pathname.startsWith("/fived") || pathname.startsWith("/k3") || pathname.startsWith("/mines") || pathname.startsWith("/limbo") || pathname.startsWith("/win");
    if (match === "my") return pathname.startsWith("/account") || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/wallet") || pathname.startsWith("/referral");
    return pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white border-t border-[#dddddd] h-[56px] grid grid-cols-4 select-none">
      {NAV_ITEMS.map(({ href, label, activeIcon, inactiveIcon, match }) => {
        const active = isActive(match, href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-[2px] text-decoration-none select-none transition-colors"
          >
            <img
              src={active ? activeIcon : inactiveIcon}
              alt={label}
              className="w-[24px] h-[24px] object-contain"
            />
            <span
              className="text-[11px] font-normal leading-none mt-[2px]"
              style={{ color: active ? "#009688" : "#999999" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
