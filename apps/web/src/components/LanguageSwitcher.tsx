"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, LOCALES, type Locale } from "../i18n/config";

const FLAG: Record<Locale, string> = { en: "🇬🇧", tr: "🇹🇷" };

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          className={l === locale ? "active" : ""}
          aria-pressed={l === locale}
          title={l === "en" ? "English" : "Türkçe"}
        >
          {FLAG[l]} {l.toUpperCase()}
        </button>
      ))}
      <style>{`
        .lang-switcher { display: flex; gap: 4px; padding: 8px 14px; }
        .lang-switcher button {
          flex: 1; font-size: 11px; font-weight: 600; padding: 5px 6px;
          border-radius: 6px; border: 1px solid var(--border, #2a2a2a);
          background: transparent; color: var(--muted); cursor: pointer;
        }
        .lang-switcher button.active { background: var(--accent, #f0b429); color: #0a0a0a; border-color: transparent; }
      `}</style>
    </div>
  );
}
