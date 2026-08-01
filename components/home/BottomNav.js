"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ICONS } from "./NavIcons";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/", label: "Home", activeIcon: NAV_ICONS.homeActive, inactiveIcon: NAV_ICONS.homeInactive, match: "home" },
  { href: "/search", label: "Search", activeIcon: NAV_ICONS.searchActive, inactiveIcon: NAV_ICONS.searchInactive, match: "search" },
  { href: "/win", label: "Win", activeIcon: NAV_ICONS.winActive, inactiveIcon: NAV_ICONS.winInactive, match: "win" },
  { href: "/account", label: "My", activeIcon: NAV_ICONS.myActive, inactiveIcon: NAV_ICONS.myInactive, match: "my" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [isLogged, setIsLogged] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsLogged(!!getToken());
    setMounted(true);
  }, []);

  const isActive = (match, href) => {
    if (match === "home") return pathname === "/";
    if (match === "search") return pathname === "/search" || pathname === "/games" || pathname.startsWith("/games/");
    if (match === "win") return pathname.startsWith("/wingo") || pathname.startsWith("/dice") || pathname.startsWith("/fived") || pathname.startsWith("/k3") || pathname.startsWith("/mines") || pathname.startsWith("/limbo") || pathname.startsWith("/win");
    if (match === "my") return pathname.startsWith("/account") || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/wallet") || pathname.startsWith("/referral");
    return pathname === href;
  };

  const visibleItems = NAV_ITEMS;
  const gridClass = "grid-cols-4";

  return (
    <nav className={`fixed bottom-0 left-0 right-0 w-full z-50 bg-white border-t border-[#dddddd] h-[50px] grid ${gridClass} select-none`}>
      {visibleItems.map(({ href, label, activeIcon, inactiveIcon, match }) => {
        const active = isActive(match, href);
        const finalHref = (!isLogged && match === "my") ? "/login" : href;
        return (
          <Link
            key={match}
            href={finalHref}
            className="flex flex-col items-center justify-center text-decoration-none select-none transition-colors h-full"
          >
            <img
              src={active ? activeIcon : inactiveIcon}
              alt={label}
              className="w-[20px] h-[20px] object-contain"
            />
            <span
              className="text-[12px] font-normal leading-none mt-[4px]"
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
