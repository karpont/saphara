import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "./config";

export default getRequestConfig(async () => {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale: Locale = LOCALES.includes(stored as Locale) ? (stored as Locale) : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
