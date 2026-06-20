"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Home, Compass, Clapperboard, ShoppingBag, Wallet,
  MessageCircle, Bell, User, Settings, Megaphone, Scissors,
  LayoutDashboard, Newspaper, Bookmark, Bot, Search, Coins,
  Trophy, Users, BookOpen, Rocket, Flame, Vote, Shield, FileText,
  Gift, Image,
} from "lucide-react";
import { useIsOwner, useNotifications } from "../hooks/useApi";
import { LanguageSwitcher } from "./LanguageSwitcher";

/* Grouped nav sections — labelKey'ler messages/{locale}.json "nav" namespace'inden çözülür */
const SECTIONS = [
  {
    titleKey: null,
    items: [
      { icon: Home,            labelKey: "home",      href: "/"              },
      { icon: Search,          labelKey: "search",    href: "/search"        },
      { icon: Compass,         labelKey: "explore",   href: "/explore"       },
      { icon: LayoutDashboard, labelKey: "dashboard", href: "/dashboard"     },
    ],
  },
  {
    titleKey: "sectionContent",
    items: [
      { icon: Clapperboard, labelKey: "reels",     href: "/reels"   },
      { icon: Scissors,     labelKey: "studio",    href: "/studio"  },
      { icon: Newspaper,    labelKey: "news",      href: "/news"    },
      { icon: BookOpen,     labelKey: "blog",      href: "/blog"    },
      { icon: Bookmark,     labelKey: "bookmarks", href: "/bookmarks" },
    ],
  },
  {
    titleKey: "sectionWeb3",
    items: [
      { icon: Rocket,      labelKey: "launchpad", href: "/launchpad" },
      { icon: ShoppingBag, labelKey: "market",    href: "/market"    },
      { icon: Image,       labelKey: "nft",       href: "/nft"       },
      { icon: Coins,       labelKey: "partCoin",  href: "/part"      },
      { icon: Flame,       labelKey: "staking",   href: "/staking"   },
      { icon: Vote,        labelKey: "dao",       href: "/dao"       },
      { icon: Wallet,      labelKey: "wallet",    href: "/wallet"    },
    ],
  },
  {
    titleKey: "sectionSocial",
    items: [
      { icon: MessageCircle, labelKey: "messages",      href: "/messages"      },
      { icon: Bell,          labelKey: "notifications", href: "/notifications" },
      { icon: Users,         labelKey: "communities",   href: "/communities"   },
      { icon: Trophy,        labelKey: "levels",        href: "/levels"        },
      { icon: Gift,          labelKey: "referral",      href: "/referral"      },
    ],
  },
  {
    titleKey: "sectionAccount",
    items: [
      { icon: User,      labelKey: "profile",   href: "/profile"   },
      { icon: Megaphone, labelKey: "advertise", href: "/advertise" },
      { icon: Shield,    labelKey: "privacy",   href: "/privacy"  },
      { icon: FileText,  labelKey: "terms",     href: "/terms"     },
      { icon: Settings,  labelKey: "settings",  href: "/settings"  },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const owner = useIsOwner();
  const notifs = useNotifications();
  const unread = notifs.data?.unread ?? 0;
  const t = useTranslations("nav");

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sidebar" aria-label="Main menu">
      <div className="brand">Saphara</div>
      <ul>
        {SECTIONS.map((section) => (
          <li key={section.titleKey ?? "top"} className="nav-section">
            {section.titleKey && <span className="nav-section-label">{t(section.titleKey)}</span>}
            <ul className="nav-section-items">
              {section.items.map(({ icon: Icon, labelKey, href }) => (
                <li key={href}>
                  <a href={href} className={isActive(href) ? "active" : ""}>
                    <Icon size={20} strokeWidth={1.75} />
                    <span>{t(labelKey)}</span>
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
              <Bot size={20} strokeWidth={1.75} /><span>{t("ownerPanel")}</span>
            </a>
          </li>
        )}
      </ul>
      <a className="compose" href="/create">{t("compose")}</a>
      <LanguageSwitcher />

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
