"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home", iconName: "home", iconClass: "material-icons", match: "home" },
  { href: "/games", label: "Search", iconName: "search", iconClass: "material-icons-outlined", match: "search" },
  { href: "/account", label: "My", iconName: "person", iconClass: "material-icons", match: "my" },
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
      {NAV_ITEMS.map(({ href, label, iconName, iconClass, match }) => {
        const active = isActive(match, href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-[2px] text-decoration-none select-none transition-colors ${
              active ? "text-[#00A091]" : "text-[#808080]"
            }`}
          >
            <span className={`${iconClass} text-[24px] leading-none`}>
              {iconName}
            </span>
            <span className="text-[12px] font-normal leading-none mt-[2px]">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
