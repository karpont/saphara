import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { Sidebar } from "../components/Sidebar";
import { ThemeProvider } from "../components/ThemeProvider";
import dynamic from "next/dynamic";

const RightRail = dynamic(() => import("../components/RightRail").then((m) => ({ default: m.RightRail })), { ssr: false });
const CryptoTicker = dynamic(() => import("../components/CryptoTicker").then((m) => ({ default: m.CryptoTicker })), { ssr: false });
const CookieBanner = dynamic(() => import("../components/CookieBanner").then((m) => ({ default: m.CookieBanner })), { ssr: false });
const MobileNav = dynamic(() => import("../components/MobileNav").then((m) => ({ default: m.MobileNav })), { ssr: false });
const LegalFooter = dynamic(() => import("../components/LegalFooter").then((m) => ({ default: m.LegalFooter })), { ssr: false });
const OnboardingModal = dynamic(() => import("../components/OnboardingModal").then((m) => ({ default: m.OnboardingModal })), { ssr: false });

export const metadata = {
  title: "Saphara — Web3 Social Platform",
  description: "Create, share, and earn with PART token. Reels, marketplace, instant messaging — own your social graph.",
  manifest: "/manifest.json",
  keywords: ["web3 social", "crypto social", "PART token", "BNB Chain", "creator economy", "NFT"],
  openGraph: {
    title: "Saphara — Web3 Social Platform",
    description: "The social platform where creators earn. Powered by PART on BNB Chain.",
    type: "website",
  },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Saphara" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f0b429",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ThemeProvider>
            <div className="shell">
              <Sidebar />
              <main className="main">
                <CryptoTicker />
                {children}
              </main>
              <aside className="rightrail">
                <RightRail />
              </aside>
            </div>
            <LegalFooter />
            <CookieBanner />
            <MobileNav />
            <OnboardingModal />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
