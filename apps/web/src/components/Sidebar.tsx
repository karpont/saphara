"use client";

import { usePathname } from "next/navigation";
import {
  Home, Compass, Clapperboard, ShoppingBag, Wallet,
  MessageCircle, Bell, User, Settings, Megaphone, Scissors,
  LayoutDashboard, Newspaper, Bookmark, Bot, Search, Coins,
  Trophy, Users, BookOpen, Rocket, Flame, Vote, Shield, FileText,
  Gift, Image,
} from "lucide-react";
import { useIsOwner, useNotifications } from "../hooks/useApi";

/* Grouped nav sections */
const SECTIONS = [
  {
    title: null,
    items: [
      { icon: Home,            label: "Ana Sayfa",      href: "/"              },
      { icon: Search,          label: "Ara",             href: "/search"        },
      { icon: Compass,         label: "Keşfet",          href: "/explore"       },
      { icon: LayoutDashboard, label: "Dashboard",       href: "/dashboard"     },
    ],
  },
  {
    title: "İçerik",
    items: [
      { icon: Clapperboard, label: "Reels",     href: "/reels"   },
      { icon: Scissors,     label: "Studio",    href: "/studio"  },
      { icon: Newspaper,    label: "Haberler",  href: "/news"    },
      { icon: BookOpen,     label: "Blog",      href: "/blog"    },
      { icon: Bookmark,     label: "Kaydedilenler", href: "/bookmarks" },
    ],
  },
  {
    title: "Web3",
    items: [
      { icon: Rocket,      label: "Launchpad",  href: "/launchpad" },
      { icon: ShoppingBag, label: "Market",     href: "/market"    },
      { icon: Image,       label: "NFT",        href: "/nft"       },
      { icon: Coins,       label: "PART Coin",  href: "/part"      },
      { icon: Flame,       label: "Staking",    href: "/staking"   },
      { icon: Vote,        label: "DAO",        href: "/dao"       },
      { icon: Wallet,      label: "Cüzdan",     href: "/wallet"    },
    ],
  },
  {
    title: "Sosyal",
    items: [
      { icon: MessageCircle, label: "Mesajlar",       href: "/messages"      },
      { icon: Bell,          label: "Bildirimler",    href: "/notifications" },
      { icon: Users,         label: "Topluluklar",    href: "/communities"   },
      { icon: Trophy,        label: "Seviyeler & XP", href: "/levels"        },
      { icon: Gift,          label: "Referral",       href: "/referral"      },
    ],
  },
  {
    title: "Hesap",
    items: [
      { icon: User,      label: "Profil",         href: "/profile"   },
      { icon: Megaphone, label: "Reklam Ver",     href: "/advertise" },
      { icon: Shield,    label: "Gizlilik / KVKK", href: "/privacy"  },
      { icon: FileText,  label: "Koşullar",       href: "/terms"     },
      { icon: Settings,  label: "Ayarlar",        href: "/settings"  },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const owner = useIsOwner();
  const notifs = useNotifications();
  const unread = notifs.data?.unread ?? 0;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sidebar" aria-label="Ana menü">
      <div className="brand">Saphara</div>
      <ul>
        {SECTIONS.map((section) => (
          <li key={section.title ?? "top"} className="nav-section">
            {section.title && <span className="nav-section-label">{section.title}</span>}
            <ul className="nav-section-items">
              {section.items.map(({ icon: Icon, label, href }) => (
                <li key={href}>
                  <a href={href} className={isActive(href) ? "active" : ""}>
                    <Icon size={20} strokeWidth={1.75} />
                    <span>{label}</span>
                    {href === "/notifications" && unread > 0 && (
                      <span className="nav-badge">{unread > 9 ? "9+" : unread}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}

        {owner.data?.isOwner && (
          <li>
            <a href="/owner" className={`owner-link${isActive("/owner") ? " active" : ""}`}>
              <Bot size={20} strokeWidth={1.75} /><span>Owner Panel</span>
            </a>
          </li>
        )}
      </ul>
      <a className="compose" href="/create">Gönderi Paylaş</a>

      <style>{`
        .nav-section { list-style: none; margin-bottom: 4px; }
        .nav-section-label {
          display: block; font-size: 10px; font-weight: 700; letter-spacing: .8px;
          text-transform: uppercase; color: var(--muted); padding: 10px 14px 4px;
          opacity: .6;
        }
        .nav-section-items { list-style: none; padding: 0; }
        @media (max-width: 1000px) {
          .nav-section-label { display: none; }
        }
      `}</style>
    </nav>
  );
}
