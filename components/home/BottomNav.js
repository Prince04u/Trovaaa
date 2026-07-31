"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home", iconName: "home", iconClass: "material-icons", match: "home" },
  { href: "/games", label: "Search", iconName: "search", iconClass: "material-icons-outlined", match: "search" },
  { href: "/wingo/30s", label: "Win", iconName: "emoji_events", iconClass: "material-icons-outlined", match: "win" },
  { href: "/account", label: "My", iconName: "person", iconClass: "material-icons", match: "my" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (match, href) => {
    if (match === "home") return pathname === "/";
    if (match === "search") return pathname === "/games" || pathname.startsWith("/games/");
    if (match === "win") return pathname.startsWith("/wingo") || pathname.startsWith("/dice") || pathname.startsWith("/fived") || pathname.startsWith("/k3") || pathname.startsWith("/mines") || pathname.startsWith("/limbo");
    if (match === "my") return pathname.startsWith("/account") || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/wallet") || pathname.startsWith("/referral");
    return pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white border-t border-[#dddddd] h-[56px] grid grid-cols-4 select-none">
      {NAV_ITEMS.map(({ href, label, iconName, iconClass, match }) => {
        const active = isActive(match, href);
        return (
          <Link
            key={href}
            href={href}
            style={{ color: active ? "#00A091" : "#999999" }}
            className="flex flex-col items-center justify-center gap-[2px] text-decoration-none select-none transition-colors"
          >
            <span
              className={`${iconClass} text-[22px] leading-none`}
              style={{ color: active ? "#00A091" : "#999999" }}
            >
              {iconName}
            </span>
            <span
              className="text-[11px] font-normal leading-none mt-[2px]"
              style={{ color: active ? "#00A091" : "#999999" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
