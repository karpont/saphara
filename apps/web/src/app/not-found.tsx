import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found — Saphara",
};

export default function NotFound() {
  return (
    <div className="notfound-wrap">
      <div className="notfound-glow" />
      <div className="notfound-card">
        <span className="notfound-code">404</span>
        <h1 className="notfound-title">Page not found</h1>
        <p className="notfound-sub">
          This page doesn&apos;t exist or was moved. No worries — the good stuff is back home.
        </p>
        <Link href="/" className="notfound-btn">Back to Saphara</Link>
      </div>

      <style>{`
        .notfound-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .notfound-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(240,180,41,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .notfound-card {
          position: relative;
          text-align: center;
          padding: 48px 32px;
          max-width: 440px;
        }
        .notfound-code {
          display: block;
          font-size: 96px;
          font-weight: 900;
          color: var(--accent);
          letter-spacing: -4px;
          opacity: 0.18;
          line-height: 1;
          margin-bottom: -16px;
        }
        .notfound-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }
        .notfound-sub {
          font-size: 15px;
          color: var(--muted);
          line-height: 1.65;
          margin-bottom: 32px;
        }
        .notfound-btn {
          display: inline-flex;
          align-items: center;
          padding: 12px 28px;
          border-radius: 999px;
          background: var(--accent);
          color: #1a1300;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .notfound-btn:hover { opacity: 0.88; }
      `}</style>
    </div>
  );
}
