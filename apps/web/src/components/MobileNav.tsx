"use client";

import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, User, Bell } from "lucide-react";
import { useNotifications } from "../hooks/useApi";

const BOTTOM_NAV = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: PlusSquare, label: "Create", href: "/create" },
  { icon: Bell, label: "Alerts", href: "/notifications" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function MobileNav() {
  const pathname = usePathname();
  const notifs = useNotifications();
  const unread = notifs.data?.unread ?? 0;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="mobile-nav" aria-label="Bottom navigation">
      {BOTTOM_NAV.map(({ icon: Icon, label, href }) => (
        <a key={href} href={href} className={`mobile-nav-item${isActive(href) ? " active" : ""}`}>
          <div className="mobile-nav-icon">
            <Icon size={24} strokeWidth={1.75} />
            {href === "/notifications" && unread > 0 && (
              <span className="mobile-nav-badge">{unread > 9 ? "9+" : unread}</span>
            )}
          </div>
          <span className="mobile-nav-label">{label}</span>
        </a>
      ))}
    </nav>
  );
}
