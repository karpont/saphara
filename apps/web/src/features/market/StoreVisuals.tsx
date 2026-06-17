"use client";

import { useId } from "react";

/* ─────────────────────── FRAMES ─────────────────────── */

export function GoldFrame({ size = 80, children }: { size?: number; children?: React.ReactNode }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={`${uid}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f7d774" /><stop offset="50%" stopColor="#f0b429" /><stop offset="100%" stopColor="#b5851f" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="none" stroke={`url(#${uid}g)`} strokeWidth="7" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#f0b42933" strokeWidth="2" />
        {[0,45,90,135,180,225,270,315].map(deg => {
          const r = deg * Math.PI / 180;
          return <circle key={deg} cx={50 + 46 * Math.cos(r)} cy={50 + 46 * Math.sin(r)} r="2.5" fill="#f0b429" />;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 9, borderRadius: "50%", overflow: "hidden", background: "#1c1f29" }}>{children}</div>
    </div>
  );
}

export function DiamondFrame({ size = 80, children }: { size?: number; children?: React.ReactNode }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={`${uid}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a5e9ff" /><stop offset="50%" stopColor="#5b8def" /><stop offset="100%" stopColor="#9b6bff" />
          </linearGradient>
        </defs>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <circle key={i} cx={50 + 44 * Math.cos(a)} cy={50 + 44 * Math.sin(a)} r="3.5" fill={`url(#${uid}g)`} />;
        })}
        <circle cx="50" cy="50" r="38" fill="none" stroke={`url(#${uid}g)`} strokeWidth="3" />
      </svg>
      <div style={{ position: "absolute", inset: 10, borderRadius: "50%", overflow: "hidden", background: "#0d0e18" }}>{children}</div>
    </div>
  );
}

export function PurpleFrame({ size = 80, children }: { size?: number; children?: React.ReactNode }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={`${uid}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c084fc" /><stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="none" stroke={`url(#${uid}g)`} strokeWidth="5" strokeDasharray="8 4" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="#c084fc44" strokeWidth="2" strokeDasharray="4 6" />
      </svg>
      <div style={{ position: "absolute", inset: 9, borderRadius: "50%", overflow: "hidden", background: "#160d2b" }}>{children}</div>
    </div>
  );
}

export function NeonFrame({ size = 80, children }: { size?: number; children?: React.ReactNode }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id={`${uid}f`}><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <circle cx="50" cy="50" r="46" fill="none" stroke="#00ffe0" strokeWidth="4" filter={`url(#${uid}f)`} />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#00ffe066" strokeWidth="2" />
        <circle cx="50" cy="50" r="46" fill="none" stroke="#00ffe0" strokeWidth="1.5" />
      </svg>
      <div style={{ position: "absolute", inset: 9, borderRadius: "50%", overflow: "hidden", background: "#031a17" }}>{children}</div>
    </div>
  );
}

export function FireFrame({ size = 80, children }: { size?: number; children?: React.ReactNode }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={`${uid}g`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff6b35" /><stop offset="50%" stopColor="#f7c94e" /><stop offset="100%" stopColor="#ff3d00" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="none" stroke={`url(#${uid}g)`} strokeWidth="7" />
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const r = deg * Math.PI / 180;
          return <circle key={deg} cx={50 + 46 * Math.cos(r)} cy={50 + 46 * Math.sin(r)} r="4" fill="#f7c94e" />;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 9, borderRadius: "50%", overflow: "hidden", background: "#1a0800" }}>{children}</div>
    </div>
  );
}

export function GalaxyFrame({ size = 80, children }: { size?: number; children?: React.ReactNode }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={`${uid}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" /><stop offset="50%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="none" stroke={`url(#${uid}g)`} strokeWidth="5" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <circle key={i} cx={50 + 43 * Math.cos(a)} cy={50 + 43 * Math.sin(a)} r={i % 3 === 0 ? 2.5 : 1.5} fill="#fff" opacity={i % 2 === 0 ? 0.9 : 0.5} />;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 9, borderRadius: "50%", overflow: "hidden", background: "#05001a" }}>{children}</div>
    </div>
  );
}

export function RainbowFrame({ size = 80, children }: { size?: number; children?: React.ReactNode }) {
  const colors = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#a78bfa", "#f472b6"];
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        {colors.map((c, i) => (
          <circle key={i} cx="50" cy="50" r="46" fill="none" stroke={c}
            strokeWidth="3.5"
            strokeDasharray={`${(100 / colors.length).toFixed(1)} ${(100 * (colors.length - 1) / colors.length).toFixed(1)}`}
            strokeDashoffset={`${-100 * i / colors.length}`} />
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 9, borderRadius: "50%", overflow: "hidden", background: "#0a0a14" }}>{children}</div>
    </div>
  );
}

export function IceFrame({ size = 80, children }: { size?: number; children?: React.ReactNode }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={`${uid}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e0f7ff" /><stop offset="50%" stopColor="#7dd3fc" /><stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <filter id={`${uid}f`}><feGaussianBlur stdDeviation="1.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <circle cx="50" cy="50" r="46" fill="none" stroke={`url(#${uid}g)`} strokeWidth="5" filter={`url(#${uid}f)`} />
        {/* Buz kristali desen */}
        {[0,60,120,180,240,300].map((deg) => {
          const r = deg * Math.PI / 180;
          const x1 = 50 + 38 * Math.cos(r), y1 = 50 + 38 * Math.sin(r);
          const x2 = 50 + 46 * Math.cos(r), y2 = 50 + 46 * Math.sin(r);
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e0f7ff" strokeWidth="2.5" opacity="0.9" />;
        })}
        {[30,90,150,210,270,330].map((deg) => {
          const r = deg * Math.PI / 180;
          return <circle key={deg} cx={50 + 44 * Math.cos(r)} cy={50 + 44 * Math.sin(r)} r="1.8" fill="#bae6fd" />;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 9, borderRadius: "50%", overflow: "hidden", background: "#030f1a" }}>{children}</div>
    </div>
  );
}

export function PlasmaFrame({ size = 80, children }: { size?: number; children?: React.ReactNode }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={`${uid}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff6fff" /><stop offset="50%" stopColor="#a855f7" /><stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id={`${uid}f`}><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <circle cx="50" cy="50" r="46" fill="none" stroke="#ff6fff" strokeWidth="6" filter={`url(#${uid}f)`} opacity="0.6" />
        <circle cx="50" cy="50" r="46" fill="none" stroke={`url(#${uid}g)`} strokeWidth="3" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#a855f744" strokeWidth="2" strokeDasharray="3 5" />
      </svg>
      <div style={{ position: "absolute", inset: 9, borderRadius: "50%", overflow: "hidden", background: "#150022" }}>{children}</div>
    </div>
  );
}

export function HexFrame({ size = 80, children }: { size?: number; children?: React.ReactNode }) {
  const uid = useId().replace(/:/g, "");
  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
    return `${50 + 46 * Math.cos(a)},${50 + 46 * Math.sin(a)}`;
  }).join(" ");
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={`${uid}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f0b429" /><stop offset="50%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#92400e" />
          </linearGradient>
        </defs>
        <polygon points={hexPoints} fill="none" stroke={`url(#${uid}g)`} strokeWidth="5" strokeLinejoin="round" />
        <polygon points={
          Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
            return `${50 + 40 * Math.cos(a)},${50 + 40 * Math.sin(a)}`;
          }).join(" ")} fill="none" stroke="#f0b42944" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", inset: 9, borderRadius: "50%", overflow: "hidden", background: "#0f0a00" }}>{children}</div>
    </div>
  );
}

/* ─────────────────────── AVATARS (15 sevimli karakter) ─────────────────────── */

export function BearAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#fb923c"/><stop offset="100%" stopColor="#7c2d12"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <circle cx="28" cy="27" r="14" fill="#c2713a"/><circle cx="72" cy="27" r="14" fill="#c2713a"/>
      <circle cx="28" cy="27" r="8" fill="#e8914a"/><circle cx="72" cy="27" r="8" fill="#e8914a"/>
      <ellipse cx="50" cy="56" rx="32" ry="30" fill="#d4834a"/>
      <ellipse cx="50" cy="66" rx="15" ry="11" fill="#f0a06a"/>
      <ellipse cx="40" cy="51" rx="7.5" ry="8.5" fill="white"/><ellipse cx="60" cy="51" rx="7.5" ry="8.5" fill="white"/>
      <circle cx="41" cy="52" r="5" fill="#1a0f00"/><circle cx="61" cy="52" r="5" fill="#1a0f00"/>
      <circle cx="42.5" cy="50.5" r="1.8" fill="white"/><circle cx="62.5" cy="50.5" r="1.8" fill="white"/>
      <ellipse cx="34" cy="62" rx="7" ry="4.5" fill="#ff9999" opacity="0.55"/><ellipse cx="66" cy="62" rx="7" ry="4.5" fill="#ff9999" opacity="0.55"/>
      <ellipse cx="50" cy="64" rx="4.5" ry="3" fill="#7c3d1a"/>
      <path d="M44 69 Q50 75 56 69" fill="none" stroke="#7c3d1a" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export function CatAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#92400e"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <path d="M24 43 L20 17 L38 36 Z" fill="#d07010"/><path d="M76 43 L80 17 L62 36 Z" fill="#d07010"/>
      <path d="M26 41 L23 22 L37 35 Z" fill="#f5b84a" opacity="0.7"/><path d="M74 41 L77 22 L63 35 Z" fill="#f5b84a" opacity="0.7"/>
      <ellipse cx="50" cy="56" rx="30" ry="28" fill="#e8943a"/>
      <ellipse cx="40" cy="51" rx="8" ry="9" fill="white"/><ellipse cx="60" cy="51" rx="8" ry="9" fill="white"/>
      <ellipse cx="40" cy="52" rx="3.5" ry="7" fill="#2d7a3a"/><ellipse cx="60" cy="52" rx="3.5" ry="7" fill="#2d7a3a"/>
      <ellipse cx="40" cy="52" rx="1.5" ry="5.5" fill="#111"/><ellipse cx="60" cy="52" rx="1.5" ry="5.5" fill="#111"/>
      <circle cx="38" cy="49" r="1.3" fill="white"/><circle cx="58" cy="49" r="1.3" fill="white"/>
      <ellipse cx="33" cy="62" rx="6" ry="4" fill="#ffaaaa" opacity="0.5"/><ellipse cx="67" cy="62" rx="6" ry="4" fill="#ffaaaa" opacity="0.5"/>
      <path d="M47 63 Q50 60 53 63 Q50 67 47 63 Z" fill="#ff6b8a"/>
      <line x1="18" y1="60" x2="42" y2="64" stroke="white" strokeWidth="1.2" opacity="0.8"/>
      <line x1="18" y1="65" x2="42" y2="67" stroke="white" strokeWidth="1.2" opacity="0.8"/>
      <line x1="58" y1="64" x2="82" y2="60" stroke="white" strokeWidth="1.2" opacity="0.8"/>
      <line x1="58" y1="67" x2="82" y2="65" stroke="white" strokeWidth="1.2" opacity="0.8"/>
      <path d="M46 69 Q50 73 54 69" fill="none" stroke="#cc5577" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
export function FoxAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#f97316"/><stop offset="100%" stopColor="#7c2d12"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <path d="M26 40 L18 12 L40 30 Z" fill="#ea580c"/><path d="M74 40 L82 12 L60 30 Z" fill="#ea580c"/>
      <path d="M27 38 L21 17 L38 29 Z" fill="#fde68a" opacity="0.8"/><path d="M73 38 L79 17 L62 29 Z" fill="#fde68a" opacity="0.8"/>
      <ellipse cx="50" cy="56" rx="30" ry="28" fill="#f97316"/>
      <ellipse cx="50" cy="65" rx="18" ry="14" fill="#fff8ec"/>
      <ellipse cx="40" cy="51" rx="7" ry="8" fill="white"/><ellipse cx="60" cy="51" rx="7" ry="8" fill="white"/>
      <circle cx="41" cy="52" r="4.5" fill="#1a0a00"/><circle cx="61" cy="52" r="4.5" fill="#1a0a00"/>
      <circle cx="42" cy="50.5" r="1.5" fill="white"/><circle cx="62" cy="50.5" r="1.5" fill="white"/>
      <ellipse cx="33" cy="61" rx="6" ry="4" fill="#ff9999" opacity="0.45"/><ellipse cx="67" cy="61" rx="6" ry="4" fill="#ff9999" opacity="0.45"/>
      <ellipse cx="50" cy="63" rx="4" ry="3" fill="#1a0a00"/>
      <path d="M45 67 Q50 72 55 67" fill="none" stroke="#1a0a00" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
export function BunnyAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#f9a8d4"/><stop offset="100%" stopColor="#831843"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <ellipse cx="36" cy="22" rx="9" ry="20" fill="#f8d7e8"/><ellipse cx="64" cy="22" rx="9" ry="20" fill="#f8d7e8"/>
      <ellipse cx="36" cy="22" rx="5" ry="15" fill="#f9a8d4"/><ellipse cx="64" cy="22" rx="5" ry="15" fill="#f9a8d4"/>
      <ellipse cx="50" cy="58" rx="30" ry="28" fill="#fce4ec"/>
      <ellipse cx="40" cy="54" rx="7.5" ry="8.5" fill="white"/><ellipse cx="60" cy="54" rx="7.5" ry="8.5" fill="white"/>
      <circle cx="41" cy="55" r="5" fill="#6366f1"/><circle cx="61" cy="55" r="5" fill="#6366f1"/>
      <circle cx="42.5" cy="53.5" r="1.8" fill="white"/><circle cx="62.5" cy="53.5" r="1.8" fill="white"/>
      <ellipse cx="34" cy="64" rx="7" ry="4.5" fill="#f9a8d4" opacity="0.7"/><ellipse cx="66" cy="64" rx="7" ry="4.5" fill="#f9a8d4" opacity="0.7"/>
      <ellipse cx="50" cy="65" rx="3.5" ry="2.5" fill="#f43f5e"/>
      <path d="M46 68 Q50 73 54 68" fill="none" stroke="#ec4899" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M47 40 L50 43 L53 40 L50 37 Z" fill="#f43f5e" opacity="0.8"/>
    </svg>
  );
}
export function OwlAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#1e1b4b"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <path d="M32 35 L28 18 L38 30 Z" fill="#7c3aed"/><path d="M68 35 L72 18 L62 30 Z" fill="#7c3aed"/>
      <ellipse cx="50" cy="58" rx="32" ry="30" fill="#6d3a1e"/>
      <ellipse cx="50" cy="68" rx="20" ry="16" fill="#d4a06a" opacity="0.7"/>
      <circle cx="38" cy="51" r="13" fill="#fef3c7"/><circle cx="62" cy="51" r="13" fill="#fef3c7"/>
      <circle cx="38" cy="52" r="9" fill="#f59e0b"/><circle cx="62" cy="52" r="9" fill="#f59e0b"/>
      <circle cx="38" cy="52" r="5.5" fill="#1a0a00"/><circle cx="62" cy="52" r="5.5" fill="#1a0a00"/>
      <circle cx="40" cy="50" r="2" fill="white"/><circle cx="64" cy="50" r="2" fill="white"/>
      <path d="M46 60 L50 55 L54 60 L50 64 Z" fill="#f59e0b"/>
      {[62,64,66,68,70,72].map((x,i)=><circle key={i} cx={x} cy={22+i} r="1.2" fill="#fde68a" opacity="0.8"/>)}
    </svg>
  );
}
export function DragonAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#064e3b"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <path d="M36 32 L30 12 L40 28 Z" fill="#059669"/><path d="M64 32 L70 12 L60 28 Z" fill="#059669"/>
      <path d="M37 31 L32 16 L40 28 Z" fill="#6ee7b7" opacity="0.6"/><path d="M63 31 L68 16 L60 28 Z" fill="#6ee7b7" opacity="0.6"/>
      <path d="M15 55 Q10 40 20 38 L32 48 Q20 52 15 55 Z" fill="#065f46" opacity="0.7"/>
      <path d="M85 55 Q90 40 80 38 L68 48 Q80 52 85 55 Z" fill="#065f46" opacity="0.7"/>
      <ellipse cx="50" cy="57" rx="30" ry="28" fill="#34d399"/>
      <ellipse cx="39" cy="52" rx="7.5" ry="8.5" fill="white"/><ellipse cx="61" cy="52" rx="7.5" ry="8.5" fill="white"/>
      <circle cx="40" cy="53" r="5" fill="#1a0a00"/><circle cx="62" cy="53" r="5" fill="#1a0a00"/>
      <circle cx="41.5" cy="51.5" r="1.8" fill="white"/><circle cx="63.5" cy="51.5" r="1.8" fill="white"/>
      <ellipse cx="32" cy="62" rx="6.5" ry="4" fill="#6ee7b7" opacity="0.6"/><ellipse cx="68" cy="62" rx="6.5" ry="4" fill="#6ee7b7" opacity="0.6"/>
      <ellipse cx="50" cy="65" rx="4" ry="2.5" fill="#065f46"/>
      <path d="M43 70 Q50 76 57 70" fill="none" stroke="#065f46" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export function PandaAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#4ade80"/><stop offset="100%" stopColor="#14532d"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <circle cx="28" cy="26" r="14" fill="#222"/><circle cx="72" cy="26" r="14" fill="#222"/>
      <ellipse cx="50" cy="57" rx="32" ry="30" fill="#f8fafc"/>
      <ellipse cx="38" cy="51" rx="10" ry="9" fill="#222" transform="rotate(-15,38,51)"/>
      <ellipse cx="62" cy="51" rx="10" ry="9" fill="#222" transform="rotate(15,62,51)"/>
      <ellipse cx="38" cy="51" rx="6" ry="7" fill="white"/><ellipse cx="62" cy="51" rx="6" ry="7" fill="white"/>
      <circle cx="39" cy="52" r="4" fill="#111"/><circle cx="63" cy="52" r="4" fill="#111"/>
      <circle cx="40.5" cy="50.5" r="1.5" fill="white"/><circle cx="64.5" cy="50.5" r="1.5" fill="white"/>
      <ellipse cx="33" cy="64" rx="7" ry="4.5" fill="#ffb3c6" opacity="0.55"/><ellipse cx="67" cy="64" rx="7" ry="4.5" fill="#ffb3c6" opacity="0.55"/>
      <ellipse cx="50" cy="64" rx="4.5" ry="3" fill="#333"/>
      <path d="M44 69 Q50 75 56 69" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 18 Q26 12 30 20 Q24 22 20 18 Z" fill="#22c55e" opacity="0.9"/>
    </svg>
  );
}
export function PenguinAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#0c4a6e"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <ellipse cx="50" cy="60" rx="28" ry="30" fill="#1e293b"/>
      <ellipse cx="50" cy="63" rx="18" ry="22" fill="#f8fafc"/>
      <path d="M22 55 Q16 62 20 72 Q26 65 30 58 Z" fill="#1e293b"/>
      <path d="M78 55 Q84 62 80 72 Q74 65 70 58 Z" fill="#1e293b"/>
      <circle cx="50" cy="44" r="22" fill="#1e293b"/>
      <ellipse cx="42" cy="42" rx="7" ry="8" fill="white"/><ellipse cx="58" cy="42" rx="7" ry="8" fill="white"/>
      <circle cx="43" cy="43" r="4.5" fill="#111"/><circle cx="59" cy="43" r="4.5" fill="#111"/>
      <circle cx="44.5" cy="41.5" r="1.8" fill="white"/><circle cx="60.5" cy="41.5" r="1.8" fill="white"/>
      <ellipse cx="35" cy="50" rx="5.5" ry="3.5" fill="#fda4af" opacity="0.6"/><ellipse cx="65" cy="50" rx="5.5" ry="3.5" fill="#fda4af" opacity="0.6"/>
      <path d="M46 50 L50 47 L54 50 L50 55 Z" fill="#f59e0b"/>
      <path d="M43 70 L47 67 L50 70 L47 73 Z" fill="#ef4444"/>
      <path d="M57 70 L53 67 L50 70 L53 73 Z" fill="#ef4444"/>
      <circle cx="50" cy="70" r="2" fill="#dc2626"/>
    </svg>
  );
}
export function CuteRobotAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#0f172a"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <line x1="50" y1="14" x2="50" y2="26" stroke="#94a3b8" strokeWidth="3"/>
      <circle cx="50" cy="12" r="5" fill="#38bdf8"/>
      <rect x="17" y="38" width="8" height="16" rx="3" fill="#475569"/>
      <rect x="75" y="38" width="8" height="16" rx="3" fill="#475569"/>
      <rect x="24" y="26" width="52" height="50" rx="10" fill="#334155"/>
      <rect x="26" y="28" width="48" height="46" rx="8" fill="#1e293b"/>
      <rect x="30" y="32" width="40" height="30" rx="6" fill="#0f172a"/>
      <rect x="34" y="37" width="12" height="12" rx="4" fill="#22d3ee" opacity="0.9"/>
      <rect x="54" y="37" width="12" height="12" rx="4" fill="#22d3ee" opacity="0.9"/>
      <rect x="36" y="39" width="8" height="8" rx="2" fill="white" opacity="0.9"/>
      <rect x="56" y="39" width="8" height="8" rx="2" fill="white" opacity="0.9"/>
      <path d="M43 53 Q45 50 50 55 Q55 50 57 53 Q57 59 50 63 Q43 59 43 53 Z" fill="#f43f5e" opacity="0.9"/>
      <circle cx="32" cy="65" r="3.5" fill="#38bdf8" opacity="0.7"/>
      <circle cx="68" cy="65" r="3.5" fill="#38bdf8" opacity="0.7"/>
    </svg>
  );
}
export function KoalaAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#86efac"/><stop offset="100%" stopColor="#14532d"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <circle cx="26" cy="26" r="18" fill="#9ca3af"/><circle cx="74" cy="26" r="18" fill="#9ca3af"/>
      <circle cx="26" cy="26" r="12" fill="#d1d5db"/><circle cx="74" cy="26" r="12" fill="#d1d5db"/>
      <ellipse cx="50" cy="57" rx="30" ry="29" fill="#b0b7c0"/>
      <ellipse cx="50" cy="64" rx="10" ry="7" fill="#374151"/>
      <ellipse cx="50" cy="62" rx="8" ry="4" fill="#4b5563"/>
      <ellipse cx="39" cy="51" rx="7" ry="8" fill="white"/><ellipse cx="61" cy="51" rx="7" ry="8" fill="white"/>
      <circle cx="40" cy="52" r="4.5" fill="#111"/><circle cx="62" cy="52" r="4.5" fill="#111"/>
      <circle cx="41.5" cy="50.5" r="1.5" fill="white"/><circle cx="63.5" cy="50.5" r="1.5" fill="white"/>
      <ellipse cx="33" cy="61" rx="6" ry="4" fill="#fda4af" opacity="0.45"/><ellipse cx="67" cy="61" rx="6" ry="4" fill="#fda4af" opacity="0.45"/>
      <path d="M44 72 Q50 77 56 72" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
      <path d="M68 20 Q76 16 78 24 Q72 26 68 20 Z" fill="#22c55e" opacity="0.9"/>
    </svg>
  );
}
export function WolfAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#1e3a8a"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <path d="M26 38 L18 14 L38 30 Z" fill="#64748b"/><path d="M74 38 L82 14 L62 30 Z" fill="#64748b"/>
      <path d="M27 36 L21 18 L37 30 Z" fill="#f8d7e8" opacity="0.6"/><path d="M73 36 L79 18 L63 30 Z" fill="#f8d7e8" opacity="0.6"/>
      <ellipse cx="50" cy="56" rx="30" ry="29" fill="#8b9bb4"/>
      <ellipse cx="50" cy="66" rx="17" ry="13" fill="#e8edf5"/>
      <ellipse cx="39" cy="50" rx="8" ry="8.5" fill="white"/><ellipse cx="61" cy="50" rx="8" ry="8.5" fill="white"/>
      <circle cx="40" cy="51" r="5.5" fill="#f59e0b"/><circle cx="62" cy="51" r="5.5" fill="#f59e0b"/>
      <circle cx="40" cy="51" r="3" fill="#1a0a00"/><circle cx="62" cy="51" r="3" fill="#1a0a00"/>
      <circle cx="41" cy="49.5" r="1.2" fill="white"/><circle cx="63" cy="49.5" r="1.2" fill="white"/>
      <ellipse cx="33" cy="61" rx="6" ry="4" fill="#fda4af" opacity="0.4"/><ellipse cx="67" cy="61" rx="6" ry="4" fill="#fda4af" opacity="0.4"/>
      <ellipse cx="50" cy="63" rx="5" ry="3.5" fill="#334155"/>
      <path d="M44 68 Q50 74 56 68" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
      <path d="M76 14 Q82 18 80 26 Q74 22 72 16 Q74 13 76 14 Z" fill="#fde68a" opacity="0.8"/>
    </svg>
  );
}
export function LionAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs>
        <radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#78350f"/></radialGradient>
        <radialGradient id={`${uid}mn`} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#d97706"/><stop offset="100%" stopColor="#92400e"/></radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <circle cx="50" cy="54" r="35" fill={`url(#${uid}mn)`}/>
      {Array.from({length:12}).map((_,i)=>{const a=(i/12)*Math.PI*2;return <path key={i} d={`M${50+28*Math.cos(a)},${54+28*Math.sin(a)} L${50+38*Math.cos(a)},${54+38*Math.sin(a)}`} stroke="#92400e" strokeWidth="6" strokeLinecap="round" opacity="0.6"/>;}).slice(0,12)}
      <ellipse cx="50" cy="54" rx="25" ry="24" fill="#fbbf24"/>
      <circle cx="28" cy="32" r="9" fill="#d97706"/><circle cx="72" cy="32" r="9" fill="#d97706"/>
      <circle cx="28" cy="32" r="5" fill="#fde68a"/><circle cx="72" cy="32" r="5" fill="#fde68a"/>
      <ellipse cx="40" cy="50" rx="7.5" ry="8" fill="white"/><ellipse cx="60" cy="50" rx="7.5" ry="8" fill="white"/>
      <circle cx="41" cy="51" r="5" fill="#065f46"/><circle cx="61" cy="51" r="5" fill="#065f46"/>
      <circle cx="41" cy="51" r="2.5" fill="#111"/><circle cx="61" cy="51" r="2.5" fill="#111"/>
      <circle cx="42" cy="49.5" r="1.2" fill="white"/><circle cx="62" cy="49.5" r="1.2" fill="white"/>
      <ellipse cx="33" cy="60" rx="6.5" ry="4" fill="#fda4af" opacity="0.5"/><ellipse cx="67" cy="60" rx="6.5" ry="4" fill="#fda4af" opacity="0.5"/>
      <ellipse cx="50" cy="63" rx="13" ry="10" fill="#fde68a"/>
      <path d="M46 62 L50 58 L54 62 L50 66 Z" fill="#c2440c"/>
      <path d="M43 68 Q50 74 57 68" fill="none" stroke="#c2440c" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export function UnicornAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs>
        <radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#e879f9"/><stop offset="100%" stopColor="#4c1d95"/></radialGradient>
        <linearGradient id={`${uid}hr`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="50%" stopColor="#f9a8d4"/><stop offset="100%" stopColor="#c084fc"/></linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <ellipse cx="30" cy="36" rx="12" ry="20" fill="#f472b6" opacity="0.6" transform="rotate(-20,30,36)"/>
      <ellipse cx="26" cy="32" rx="8" ry="18" fill="#a78bfa" opacity="0.5" transform="rotate(-20,26,32)"/>
      <polygon points="50,8 45,32 55,32" fill={`url(#${uid}hr)`}/>
      <line x1="47" y1="16" x2="52" y2="14" stroke="white" strokeWidth="1" opacity="0.5"/>
      <line x1="46" y1="22" x2="53" y2="20" stroke="white" strokeWidth="1" opacity="0.5"/>
      <line x1="46" y1="28" x2="54" y2="26" stroke="white" strokeWidth="1" opacity="0.5"/>
      <ellipse cx="50" cy="57" rx="28" ry="26" fill="#fce4ec"/>
      <ellipse cx="40" cy="52" rx="7.5" ry="8.5" fill="white"/><ellipse cx="60" cy="52" rx="7.5" ry="8.5" fill="white"/>
      <circle cx="41" cy="53" r="5.5" fill="#c084fc"/><circle cx="61" cy="53" r="5.5" fill="#c084fc"/>
      <circle cx="41" cy="53" r="2.5" fill="#111"/><circle cx="61" cy="53" r="2.5" fill="#111"/>
      <circle cx="42.5" cy="51.5" r="1.5" fill="white"/><circle cx="62.5" cy="51.5" r="1.5" fill="white"/>
      <ellipse cx="33" cy="63" rx="7" ry="4.5" fill="#f9a8d4" opacity="0.7"/><ellipse cx="67" cy="63" rx="7" ry="4.5" fill="#f9a8d4" opacity="0.7"/>
      <ellipse cx="50" cy="66" rx="4" ry="2.8" fill="#f472b6"/>
      <path d="M45 70 Q50 75 55 70" fill="none" stroke="#f472b6" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="75" cy="18" r="2.5" fill="#fde68a" opacity="0.8"/>
      <circle cx="80" cy="28" r="1.8" fill="#fde68a" opacity="0.7"/>
      <circle cx="72" cy="34" r="1.2" fill="#fde68a" opacity="0.6"/>
    </svg>
  );
}
export function FrogAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#4ade80"/><stop offset="100%" stopColor="#14532d"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <circle cx="36" cy="34" r="14" fill="#22c55e"/><circle cx="64" cy="34" r="14" fill="#22c55e"/>
      <ellipse cx="50" cy="60" rx="33" ry="27" fill="#22c55e"/>
      <ellipse cx="50" cy="68" rx="22" ry="16" fill="#bbf7d0" opacity="0.6"/>
      <ellipse cx="36" cy="34" rx="8.5" ry="9.5" fill="white"/><ellipse cx="64" cy="34" rx="8.5" ry="9.5" fill="white"/>
      <circle cx="37" cy="35" r="6" fill="#1a5c1a"/><circle cx="65" cy="35" r="6" fill="#1a5c1a"/>
      <circle cx="37" cy="35" r="3" fill="#111"/><circle cx="65" cy="35" r="3" fill="#111"/>
      <circle cx="38.5" cy="33.5" r="1.2" fill="white"/><circle cx="66.5" cy="33.5" r="1.2" fill="white"/>
      <ellipse cx="33" cy="66" rx="7" ry="4.5" fill="#fda4af" opacity="0.55"/><ellipse cx="67" cy="66" rx="7" ry="4.5" fill="#fda4af" opacity="0.55"/>
      <circle cx="47" cy="58" r="2.5" fill="#16a34a"/><circle cx="53" cy="58" r="2.5" fill="#16a34a"/>
      <path d="M34 67 Q50 80 66 67" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M42 30 L44 24 L47 28 L50 22 L53 28 L56 24 L58 30 Z" fill="#f59e0b" opacity="0.9"/>
    </svg>
  );
}
export function DuckAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#075985"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <ellipse cx="18" cy="62" rx="10" ry="7" fill="#fde047" transform="rotate(-30,18,62)" opacity="0.8"/>
      <ellipse cx="82" cy="62" rx="10" ry="7" fill="#fde047" transform="rotate(30,82,62)" opacity="0.8"/>
      <ellipse cx="50" cy="57" rx="30" ry="29" fill="#fde047"/>
      <ellipse cx="40" cy="51" rx="7.5" ry="8.5" fill="white"/><ellipse cx="60" cy="51" rx="7.5" ry="8.5" fill="white"/>
      <circle cx="41" cy="52" r="5" fill="#111"/><circle cx="61" cy="52" r="5" fill="#111"/>
      <circle cx="42.5" cy="50.5" r="1.8" fill="white"/><circle cx="62.5" cy="50.5" r="1.8" fill="white"/>
      <ellipse cx="33" cy="62" rx="7" ry="4.5" fill="#fda4af" opacity="0.55"/><ellipse cx="67" cy="62" rx="7" ry="4.5" fill="#fda4af" opacity="0.55"/>
      <path d="M40 64 Q50 60 60 64 L58 72 Q50 76 42 72 Z" fill="#fb923c"/>
      <line x1="40" y1="68" x2="60" y2="68" stroke="#ea580c" strokeWidth="1.5"/>
      <path d="M46 30 Q50 22 54 30" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}
export function HamsterAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#fb923c"/><stop offset="100%" stopColor="#92400e"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <circle cx="28" cy="28" r="13" fill="#fca5a5"/><circle cx="72" cy="28" r="13" fill="#fca5a5"/>
      <circle cx="28" cy="28" r="8" fill="#fecdd3"/><circle cx="72" cy="28" r="8" fill="#fecdd3"/>
      <ellipse cx="25" cy="62" rx="14" ry="10" fill="#fed7aa" opacity="0.8"/>
      <ellipse cx="75" cy="62" rx="14" ry="10" fill="#fed7aa" opacity="0.8"/>
      <ellipse cx="50" cy="54" rx="28" ry="28" fill="#fdba74"/>
      <ellipse cx="50" cy="66" rx="15" ry="11" fill="#fef3c7" opacity="0.7"/>
      <ellipse cx="41" cy="50" rx="7" ry="7.5" fill="white"/><ellipse cx="59" cy="50" rx="7" ry="7.5" fill="white"/>
      <circle cx="42" cy="51" r="4.5" fill="#1a0a00"/><circle cx="60" cy="51" r="4.5" fill="#1a0a00"/>
      <circle cx="43.5" cy="49.5" r="1.6" fill="white"/><circle cx="61.5" cy="49.5" r="1.6" fill="white"/>
      <ellipse cx="35" cy="61" rx="7" ry="4.5" fill="#ff9999" opacity="0.6"/><ellipse cx="65" cy="61" rx="7" ry="4.5" fill="#ff9999" opacity="0.6"/>
      <ellipse cx="50" cy="62" rx="4" ry="2.5" fill="#be123c"/>
      <path d="M44 66 Q50 72 56 66" fill="none" stroke="#be123c" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="72" cy="76" rx="5" ry="3" fill="#d97706" opacity="0.8" transform="rotate(-30,72,76)"/>
    </svg>
  );
}
export function HorseAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#c4853a"/><stop offset="100%" stopColor="#7c3c1a"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <path d="M30 38 L22 12 L38 30 Z" fill="#b45309"/><path d="M32 36 L26 16 L37 30 Z" fill="#fde68a" opacity="0.6"/>
      <path d="M70 38 L78 12 L62 30 Z" fill="#b45309"/><path d="M68 36 L74 16 L63 30 Z" fill="#fde68a" opacity="0.6"/>
      <path d="M36 19 Q38 8 42 15" stroke="#7c3c1a" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M41 17 Q43 6 47 13" stroke="#6b2d0a" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <ellipse cx="50" cy="57" rx="28" ry="30" fill="#d4943f"/>
      <ellipse cx="50" cy="72" rx="16" ry="12" fill="#e8b87a"/>
      <ellipse cx="44" cy="74" rx="3.5" ry="2.5" fill="#a0582a"/>
      <ellipse cx="56" cy="74" rx="3.5" ry="2.5" fill="#a0582a"/>
      <ellipse cx="38" cy="51" rx="7.5" ry="8.5" fill="white"/>
      <ellipse cx="62" cy="51" rx="7.5" ry="8.5" fill="white"/>
      <circle cx="39" cy="52" r="5" fill="#1a0a00"/><circle cx="63" cy="52" r="5" fill="#1a0a00"/>
      <circle cx="40.5" cy="50.5" r="1.8" fill="white"/><circle cx="64.5" cy="50.5" r="1.8" fill="white"/>
      <ellipse cx="31" cy="62" rx="6" ry="4" fill="#ff9999" opacity="0.4"/>
      <ellipse cx="69" cy="62" rx="6" ry="4" fill="#ff9999" opacity="0.4"/>
    </svg>
  );
}
export function DogAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#d97706"/><stop offset="100%" stopColor="#78350f"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <ellipse cx="26" cy="55" rx="15" ry="20" fill="#b45309" transform="rotate(15,26,55)"/>
      <ellipse cx="74" cy="55" rx="15" ry="20" fill="#b45309" transform="rotate(-15,74,55)"/>
      <ellipse cx="50" cy="52" rx="26" ry="27" fill="#d97706"/>
      <ellipse cx="50" cy="67" rx="15" ry="11" fill="#fde68a"/>
      <ellipse cx="50" cy="62" rx="6" ry="5" fill="#1a0a00"/>
      <circle cx="48" cy="60.5" r="1.5" fill="rgba(255,255,255,0.4)"/>
      <ellipse cx="38" cy="49" rx="7.5" ry="8.5" fill="white"/>
      <ellipse cx="62" cy="49" rx="7.5" ry="8.5" fill="white"/>
      <circle cx="39" cy="50" r="5" fill="#1a0a00"/><circle cx="63" cy="50" r="5" fill="#1a0a00"/>
      <circle cx="40.5" cy="48.5" r="1.8" fill="white"/><circle cx="64.5" cy="48.5" r="1.8" fill="white"/>
      <ellipse cx="32" cy="62" rx="6" ry="4" fill="#fda4af" opacity="0.5"/>
      <ellipse cx="68" cy="62" rx="6" ry="4" fill="#fda4af" opacity="0.5"/>
      <path d="M44 70 Q50 77 56 70" fill="none" stroke="#c2440c" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export function TigerAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#f97316"/><stop offset="100%" stopColor="#7c2d12"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <path d="M30 38 L22 14 L40 30 Z" fill="#ea580c"/><path d="M70 38 L78 14 L60 30 Z" fill="#ea580c"/>
      <path d="M31 36 L25 18 L38 30 Z" fill="#fde68a" opacity="0.7"/><path d="M69 36 L75 18 L62 30 Z" fill="#fde68a" opacity="0.7"/>
      <ellipse cx="50" cy="55" rx="30" ry="28" fill="#f97316"/>
      <path d="M40 30 Q43 22 46 30" fill="none" stroke="#1a0a00" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M54 30 Q57 22 60 30" fill="none" stroke="#1a0a00" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      <line x1="19" y1="57" x2="35" y2="54" stroke="#1a0a00" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <line x1="19" y1="63" x2="35" y2="61" stroke="#1a0a00" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <line x1="65" y1="54" x2="81" y2="57" stroke="#1a0a00" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <line x1="65" y1="61" x2="81" y2="63" stroke="#1a0a00" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <ellipse cx="50" cy="66" rx="18" ry="13" fill="#fde68a"/>
      <ellipse cx="38" cy="49" rx="7.5" ry="8.5" fill="white"/>
      <ellipse cx="62" cy="49" rx="7.5" ry="8.5" fill="white"/>
      <circle cx="39" cy="50" r="5" fill="#065f46"/><circle cx="63" cy="50" r="5" fill="#065f46"/>
      <circle cx="39" cy="50" r="2.5" fill="#111"/><circle cx="63" cy="50" r="2.5" fill="#111"/>
      <circle cx="40.5" cy="48.5" r="1.5" fill="white"/><circle cx="64.5" cy="48.5" r="1.5" fill="white"/>
      <ellipse cx="50" cy="62" rx="5" ry="3.5" fill="#c2440c"/>
      <path d="M44 68 Q50 74 56 68" fill="none" stroke="#c2440c" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export function TurtleAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#16a34a"/><stop offset="100%" stopColor="#14532d"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <ellipse cx="50" cy="58" rx="30" ry="24" fill="#15803d"/>
      <path d="M25 42 Q19 36 20 28 Q27 27 30 36 Z" fill="#22c55e" opacity="0.8"/>
      <path d="M75 42 Q81 36 80 28 Q73 27 70 36 Z" fill="#22c55e" opacity="0.8"/>
      <path d="M30 73 Q24 79 20 76 Q19 69 26 68 Z" fill="#22c55e" opacity="0.8"/>
      <path d="M70 73 Q76 79 80 76 Q81 69 74 68 Z" fill="#22c55e" opacity="0.8"/>
      <ellipse cx="50" cy="58" rx="24" ry="20" fill="#4ade80" opacity="0.35"/>
      <path d="M35 42 L50 32 L65 42 L65 70 L50 78 L35 70 Z" fill="none" stroke="#15803d" strokeWidth="2"/>
      <line x1="50" y1="32" x2="50" y2="78" stroke="#15803d" strokeWidth="1.5"/>
      <line x1="35" y1="55" x2="65" y2="55" stroke="#15803d" strokeWidth="1.5"/>
      <ellipse cx="50" cy="37" rx="16" ry="14" fill="#78350f"/>
      <ellipse cx="43" cy="34" rx="5.5" ry="6" fill="white"/><ellipse cx="57" cy="34" rx="5.5" ry="6" fill="white"/>
      <circle cx="44" cy="35" r="3.5" fill="#1a0a00"/><circle cx="58" cy="35" r="3.5" fill="#1a0a00"/>
      <circle cx="45.5" cy="33.5" r="1.3" fill="white"/><circle cx="59.5" cy="33.5" r="1.3" fill="white"/>
      <path d="M47 43 Q50 46 53 43" fill="none" stroke="#7c3c1a" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
export function EagleAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#78350f"/><stop offset="100%" stopColor="#1c0a00"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <path d="M15 42 L5 26 Q20 23 30 36 Z" fill="#92400e" opacity="0.9"/>
      <path d="M85 42 L95 26 Q80 23 70 36 Z" fill="#92400e" opacity="0.9"/>
      <ellipse cx="50" cy="54" rx="28" ry="26" fill="#1c0a00"/>
      <ellipse cx="50" cy="36" rx="22" ry="20" fill="#fef3c7"/>
      <ellipse cx="37" cy="33" rx="9" ry="10" fill="white"/>
      <ellipse cx="63" cy="33" rx="9" ry="10" fill="white"/>
      <circle cx="38" cy="34" r="6" fill="#f59e0b"/><circle cx="64" cy="34" r="6" fill="#f59e0b"/>
      <circle cx="38" cy="34" r="3.5" fill="#111"/><circle cx="64" cy="34" r="3.5" fill="#111"/>
      <circle cx="39.5" cy="32.5" r="1.5" fill="white"/><circle cx="65.5" cy="32.5" r="1.5" fill="white"/>
      <path d="M38 48 L50 45 L62 48 L58 55 L50 59 L42 55 Z" fill="#fbbf24"/>
      <path d="M44 51 L50 49 L56 51" fill="none" stroke="#92400e" strokeWidth="1.5"/>
      <ellipse cx="50" cy="73" rx="16" ry="12" fill="#fef3c7"/>
      <ellipse cx="33" cy="64" rx="6" ry="4" fill="#fda4af" opacity="0.4"/>
      <ellipse cx="67" cy="64" rx="6" ry="4" fill="#fda4af" opacity="0.4"/>
    </svg>
  );
}
export function HedgehogAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#92400e"/><stop offset="100%" stopColor="#3b1a00"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      {Array.from({length:7}).map((_,i)=>{const a=(i/7)*Math.PI;return <line key={i} x1={50+20*Math.cos(a)} y1={42+20*Math.sin(a)} x2={50+34*Math.cos(a)} y2={42+34*Math.sin(a)} stroke="#d97706" strokeWidth="4" strokeLinecap="round"/>;} )}
      <ellipse cx="50" cy="58" rx="30" ry="24" fill="#d97706"/>
      <ellipse cx="50" cy="64" rx="22" ry="16" fill="#fde68a" opacity="0.8"/>
      <ellipse cx="38" cy="53" rx="7.5" ry="8" fill="white"/>
      <ellipse cx="62" cy="53" rx="7.5" ry="8" fill="white"/>
      <circle cx="39" cy="54" r="5" fill="#111"/><circle cx="63" cy="54" r="5" fill="#111"/>
      <circle cx="40.5" cy="52.5" r="1.8" fill="white"/><circle cx="64.5" cy="52.5" r="1.8" fill="white"/>
      <ellipse cx="33" cy="64" rx="5.5" ry="3.5" fill="#fda4af" opacity="0.5"/>
      <ellipse cx="67" cy="64" rx="5.5" ry="3.5" fill="#fda4af" opacity="0.5"/>
      <ellipse cx="50" cy="63" rx="5" ry="3.5" fill="#92400e"/>
      <path d="M44 68 Q50 74 56 68" fill="none" stroke="#7c3c1a" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export function SheepAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#64748b"/><stop offset="100%" stopColor="#1e293b"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      {[{cx:35,cy:32,r:14},{cx:50,cy:26,r:16},{cx:65,cy:32,r:14},{cx:25,cy:45,r:13},{cx:75,cy:45,r:13},{cx:32,cy:60,r:12},{cx:68,cy:60,r:12}].map((c,i)=>
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="#f1f5f9" opacity="0.9"/>
      )}
      <ellipse cx="50" cy="61" rx="22" ry="18" fill="#334155"/>
      <ellipse cx="50" cy="70" rx="14" ry="10" fill="#475569"/>
      <ellipse cx="38" cy="57" rx="7" ry="7.5" fill="white"/>
      <ellipse cx="62" cy="57" rx="7" ry="7.5" fill="white"/>
      <circle cx="39" cy="58" r="4.5" fill="#c084fc"/><circle cx="63" cy="58" r="4.5" fill="#c084fc"/>
      <circle cx="39" cy="58" r="2" fill="#111"/><circle cx="63" cy="58" r="2" fill="#111"/>
      <circle cx="40.5" cy="56.5" r="1.2" fill="white"/><circle cx="64.5" cy="56.5" r="1.2" fill="white"/>
      <ellipse cx="34" cy="68" rx="5.5" ry="3.5" fill="#fda4af" opacity="0.5"/>
      <ellipse cx="66" cy="68" rx="5.5" ry="3.5" fill="#fda4af" opacity="0.5"/>
      <ellipse cx="50" cy="66" rx="4" ry="2.5" fill="#3b0764"/>
      <path d="M44 71 Q50 77 56 71" fill="none" stroke="#3b0764" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export function MonkeyAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#92400e"/><stop offset="100%" stopColor="#3b1a00"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <circle cx="24" cy="38" r="16" fill="#92400e"/><circle cx="76" cy="38" r="16" fill="#92400e"/>
      <circle cx="24" cy="38" r="10" fill="#fde68a" opacity="0.7"/><circle cx="76" cy="38" r="10" fill="#fde68a" opacity="0.7"/>
      <ellipse cx="50" cy="54" rx="30" ry="28" fill="#92400e"/>
      <ellipse cx="50" cy="65" rx="20" ry="15" fill="#fde68a" opacity="0.8"/>
      <ellipse cx="39" cy="49" rx="7.5" ry="8.5" fill="white"/>
      <ellipse cx="61" cy="49" rx="7.5" ry="8.5" fill="white"/>
      <circle cx="40" cy="50" r="5" fill="#1a0a00"/><circle cx="62" cy="50" r="5" fill="#1a0a00"/>
      <circle cx="41.5" cy="48.5" r="1.8" fill="white"/><circle cx="63.5" cy="48.5" r="1.8" fill="white"/>
      <ellipse cx="32" cy="61" rx="6.5" ry="4" fill="#fda4af" opacity="0.5"/>
      <ellipse cx="68" cy="61" rx="6.5" ry="4" fill="#fda4af" opacity="0.5"/>
      <ellipse cx="44" cy="63" rx="4" ry="3" fill="#7c3c1a"/><ellipse cx="56" cy="63" rx="4" ry="3" fill="#7c3c1a"/>
      <path d="M44 68 Q50 74 56 68" fill="none" stroke="#7c3c1a" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export function GiraffeAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#d97706"/><stop offset="100%" stopColor="#78350f"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <path d="M40 20 L36 8 L42 5 L44 18 Z" fill="#b45309"/>
      <path d="M60 20 L64 8 L58 5 L56 18 Z" fill="#b45309"/>
      <circle cx="39" cy="6" r="4" fill="#92400e"/>
      <circle cx="61" cy="6" r="4" fill="#92400e"/>
      <ellipse cx="50" cy="55" rx="28" ry="26" fill="#fbbf24"/>
      {[{cx:35,cy:45,r:8},{cx:60,cy:38,r:7},{cx:40,cy:65,r:9},{cx:62,cy:60,r:8},{cx:50,cy:49,r:7}].map((s,i)=>
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#92400e" opacity="0.6"/>
      )}
      <ellipse cx="50" cy="65" rx="16" ry="12" fill="#f59e0b"/>
      <ellipse cx="38" cy="50" rx="7" ry="7.5" fill="white"/>
      <ellipse cx="62" cy="50" rx="7" ry="7.5" fill="white"/>
      <circle cx="39" cy="51" r="4.5" fill="#1a0a00"/><circle cx="63" cy="51" r="4.5" fill="#1a0a00"/>
      <circle cx="40.5" cy="49.5" r="1.6" fill="white"/><circle cx="64.5" cy="49.5" r="1.6" fill="white"/>
      <ellipse cx="33" cy="62" rx="5.5" ry="3.5" fill="#fda4af" opacity="0.5"/>
      <ellipse cx="67" cy="62" rx="5.5" ry="3.5" fill="#fda4af" opacity="0.5"/>
      <path d="M44 70 Q50 76 56 70" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export function DolphinAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#0284c7"/><stop offset="100%" stopColor="#082f49"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <path d="M15 30 Q8 20 18 14 Q26 22 24 36 Z" fill="#0369a1" opacity="0.9"/>
      <path d="M85 58 Q94 66 86 76 Q78 70 76 58 Z" fill="#0369a1" opacity="0.9"/>
      <ellipse cx="50" cy="54" rx="32" ry="24" fill="#38bdf8"/>
      <ellipse cx="50" cy="62" rx="24" ry="16" fill="#7dd3fc" opacity="0.5"/>
      <ellipse cx="40" cy="48" rx="8.5" ry="9.5" fill="white"/>
      <ellipse cx="62" cy="48" rx="8.5" ry="9.5" fill="white"/>
      <circle cx="41" cy="49" r="5.5" fill="#0369a1"/><circle cx="63" cy="49" r="5.5" fill="#0369a1"/>
      <circle cx="41" cy="49" r="2.5" fill="#111"/><circle cx="63" cy="49" r="2.5" fill="#111"/>
      <circle cx="42.5" cy="47.5" r="1.5" fill="white"/><circle cx="64.5" cy="47.5" r="1.5" fill="white"/>
      <ellipse cx="33" cy="58" rx="6" ry="4" fill="#bae6fd" opacity="0.7"/>
      <ellipse cx="67" cy="58" rx="6" ry="4" fill="#bae6fd" opacity="0.7"/>
      <path d="M36 64 Q50 72 64 64 Q70 70 50 80 Q30 70 36 64 Z" fill="#38bdf8" opacity="0.8"/>
      <path d="M44 54 Q50 60 56 54" fill="none" stroke="#0369a1" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export function ElephantAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#64748b"/><stop offset="100%" stopColor="#1e293b"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <ellipse cx="20" cy="50" rx="18" ry="22" fill="#475569"/>
      <ellipse cx="80" cy="50" rx="18" ry="22" fill="#475569"/>
      <ellipse cx="20" cy="50" rx="11" ry="14" fill="#fda4af" opacity="0.4"/>
      <ellipse cx="80" cy="50" rx="11" ry="14" fill="#fda4af" opacity="0.4"/>
      <ellipse cx="50" cy="50" rx="28" ry="28" fill="#94a3b8"/>
      <path d="M39 66 Q36 76 40 85 Q44 88 48 85 Q46 78 46 70" fill="#94a3b8"/>
      <ellipse cx="44" cy="85" rx="7" ry="4" fill="#7e96b5"/>
      <ellipse cx="39" cy="46" rx="7.5" ry="8" fill="white"/>
      <ellipse cx="61" cy="46" rx="7.5" ry="8" fill="white"/>
      <circle cx="40" cy="47" r="5" fill="#1a0a00"/><circle cx="62" cy="47" r="5" fill="#1a0a00"/>
      <circle cx="41.5" cy="45.5" r="1.8" fill="white"/><circle cx="63.5" cy="45.5" r="1.8" fill="white"/>
      <ellipse cx="33" cy="58" rx="5.5" ry="3.5" fill="#fda4af" opacity="0.5"/>
      <ellipse cx="67" cy="58" rx="5.5" ry="3.5" fill="#fda4af" opacity="0.5"/>
      <path d="M43 68 Q38 74 36 80" fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round"/>
      <path d="M57 68 Q62 74 64 80" fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}
export function DeerAvatar({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><radialGradient id={`${uid}bg`} cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#b45309"/><stop offset="100%" stopColor="#7c2d12"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}bg)`}/>
      <path d="M30 32 L20 6 L28 10 L36 24 Z" fill="#92400e"/>
      <path d="M28 20 L22 8 L30 12 L32 22 Z" fill="#92400e"/>
      <path d="M70 32 L80 6 L72 10 L64 24 Z" fill="#92400e"/>
      <path d="M72 20 L78 8 L70 12 L68 22 Z" fill="#92400e"/>
      <ellipse cx="50" cy="55" rx="27" ry="27" fill="#c4853a"/>
      <ellipse cx="50" cy="67" rx="17" ry="12" fill="#fde68a"/>
      <ellipse cx="38" cy="50" rx="7.5" ry="8.5" fill="white"/>
      <ellipse cx="62" cy="50" rx="7.5" ry="8.5" fill="white"/>
      <circle cx="39" cy="51" r="5" fill="#1a0a00"/><circle cx="63" cy="51" r="5" fill="#1a0a00"/>
      <circle cx="40.5" cy="49.5" r="1.8" fill="white"/><circle cx="64.5" cy="49.5" r="1.8" fill="white"/>
      <ellipse cx="32" cy="62" rx="6" ry="4" fill="#fda4af" opacity="0.5"/>
      <ellipse cx="68" cy="62" rx="6" ry="4" fill="#fda4af" opacity="0.5"/>
      <ellipse cx="50" cy="64" rx="5" ry="3.5" fill="#1a0a00"/>
      <path d="M44 69 Q50 75 56 69" fill="none" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/* ─────────────────────── BADGES (12 adet) ─────────────────────── */

function BadgeBase({ size, bg1, bg2, icon }: { size: number; bg1: string; bg2: string; icon: React.ReactNode }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs><linearGradient id={`${uid}bd`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={bg1} /><stop offset="100%" stopColor={bg2} /></linearGradient></defs>
      <path d="M50 5 L62 20 L80 18 L78 37 L94 50 L78 63 L80 82 L62 80 L50 95 L38 80 L20 82 L22 63 L6 50 L22 37 L20 18 L38 20 Z" fill={`url(#${uid}bd)`} />
      <path d="M50 10 L60 23 L75 21 L73 37 L87 50 L73 63 L75 79 L60 77 L50 90 L40 77 L25 79 L27 63 L13 50 L27 37 L25 21 L40 23 Z" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      {icon}
    </svg>
  );
}

export function EarlyBadge({ size = 64 }: { size?: number }) {
  return <BadgeBase size={size} bg1="#4ade80" bg2="#065f46" icon={
    <>
      <path d="M50 28 Q55 34 56 44 L50 52 L44 44 Q45 34 50 28Z" fill="#fff" opacity="0.95"/>
      <path d="M44 46 L40 54 L48 50Z" fill="#fde68a" opacity="0.9"/>
      <path d="M56 46 L60 54 L52 50Z" fill="#fde68a" opacity="0.9"/>
      <circle cx="50" cy="38" r="3.5" fill="#4ade80" opacity="0.85"/>
      <rect x="44" y="54" width="12" height="5" rx="2" fill="#f97316" opacity="0.9"/>
    </>
  } />;
}
export function CreatorBadge({ size = 64 }: { size?: number }) {
  return <BadgeBase size={size} bg1="#f0b429" bg2="#92400e" icon={
    <>
      <rect x="47" y="28" width="6" height="22" rx="2" fill="#fff" opacity="0.9"/>
      <path d="M44 50 Q44 60 50 64 Q56 60 56 50Z" fill="#7c3aed" opacity="0.9"/>
      <rect x="45" y="25" width="10" height="6" rx="2" fill="#d4a017" opacity="0.85"/>
      <circle cx="64" cy="36" r="5" fill="#f87171"/>
      <circle cx="66" cy="30" r="3" fill="#60a5fa"/>
      <circle cx="60" cy="28" r="3.5" fill="#4ade80"/>
    </>
  } />;
}
export function InvestorBadge({ size = 64 }: { size?: number }) {
  return <BadgeBase size={size} bg1="#a78bfa" bg2="#4c1d95" icon={
    <>
      <path d="M30 68 L40 52 L50 60 L62 36 L70 44" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M64 36 L70 36 L70 44" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="62" cy="36" r="3.5" fill="#fde68a"/>
      <line x1="30" y1="70" x2="72" y2="70" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
    </>
  } />;
}
export function InfluencerBadge({ size = 64 }: { size?: number }) {
  return <BadgeBase size={size} bg1="#f472b6" bg2="#9d174d" icon={
    <>
      <path d="M34 44 L34 56 L40 56 L54 66 L54 34 L40 44Z" fill="#fff" opacity="0.95"/>
      <rect x="58" y="44" width="6" height="12" rx="3" fill="#fff" opacity="0.75"/>
      <path d="M58 46 Q65 50 58 54" fill="none" stroke="#fde68a" strokeWidth="2" strokeLinecap="round"/>
      <line x1="56" y1="30" x2="60" y2="26" stroke="#fde68a" strokeWidth="2" strokeLinecap="round"/>
      <line x1="60" y1="34" x2="66" y2="30" stroke="#fde68a" strokeWidth="2" strokeLinecap="round"/>
    </>
  } />;
}
export function CryptoBadge({ size = 64 }: { size?: number }) {
  return <BadgeBase size={size} bg1="#38bdf8" bg2="#0c4a6e" icon={
    <>
      <text x="50" y="58" textAnchor="middle" fontSize="30" fill="#fff" fontWeight="bold">₿</text>
    </>
  } />;
}
export function BnbOgBadge({ size = 64 }: { size?: number }) {
  return <BadgeBase size={size} bg1="#fbbf24" bg2="#78350f" icon={
    <>
      <path d="M50 30 L56 42 L50 50 L44 42Z" fill="#1a0800" opacity="0.9"/>
      <path d="M42 46 L44 42 L50 50 L44 54Z" fill="#1a0800" opacity="0.7"/>
      <path d="M58 46 L56 42 L50 50 L56 54Z" fill="#1a0800" opacity="0.7"/>
      <path d="M44 54 L50 50 L56 54 L50 62Z" fill="#1a0800" opacity="0.9"/>
      <text x="50" y="74" textAnchor="middle" fontSize="10" fill="#1a0800" fontWeight="bold">OG</text>
    </>
  } />;
}
export function ArtBadge({ size = 64 }: { size?: number }) {
  return <BadgeBase size={size} bg1="#c084fc" bg2="#6d28d9" icon={
    <>
      <ellipse cx="50" cy="50" r="14" fill="rgba(255,255,255,0.15)" stroke="#fff" strokeWidth="1.5"/>
      {[{c:"#f87171",x:41,y:41},{c:"#60a5fa",x:60,y:42},{c:"#4ade80",x:61,y:57},{c:"#facc15",x:42,y:58},{c:"#e879f9",x:51,y:37}].map(({c,x,y},i)=>(
        <circle key={i} cx={x} cy={y} r="4.5" fill={c}/>
      ))}
      <circle cx="47" cy="54" r="5.5" fill="#1e1b4b" opacity="0.5"/>
    </>
  } />;
}
export function ReelsBadge({ size = 64 }: { size?: number }) {
  return <BadgeBase size={size} bg1="#fb923c" bg2="#9a3412" icon={
    <>
      <rect x="30" y="39" width="28" height="22" rx="4" fill="#fff" opacity="0.9"/>
      <path d="M58 44 L70 40 L70 60 L58 56Z" fill="#fff" opacity="0.7"/>
      <rect x="34" y="43" width="20" height="14" rx="2" fill="#fb923c" opacity="0.65"/>
      <circle cx="44" cy="50" r="4" fill="rgba(255,255,255,0.9)"/>
      <circle cx="44" cy="50" r="2" fill="#9a3412"/>
    </>
  } />;
}
export function StakingBadge({ size = 64 }: { size?: number }) {
  return <BadgeBase size={size} bg1="#10b981" bg2="#064e3b" icon={
    <>
      <ellipse cx="50" cy="62" rx="13" ry="5" fill="#fde68a" opacity="0.9"/>
      <rect x="37" y="55" width="26" height="7" rx="2" fill="#fbbf24" opacity="0.9"/>
      <ellipse cx="50" cy="55" rx="13" ry="5" fill="#fde68a" opacity="0.9"/>
      <rect x="37" y="47" width="26" height="8" rx="2" fill="#fbbf24" opacity="0.9"/>
      <ellipse cx="50" cy="47" rx="13" ry="5" fill="#fde68a" opacity="0.9"/>
      <rect x="37" y="39" width="26" height="8" rx="2" fill="#fbbf24" opacity="0.9"/>
      <ellipse cx="50" cy="39" rx="13" ry="5" fill="#fde68a" opacity="0.9"/>
    </>
  } />;
}
export function DiamondHandsBadge({ size = 64 }: { size?: number }) {
  return <BadgeBase size={size} bg1="#a5f3fc" bg2="#0c4a6e" icon={
    <>
      <path d="M50 27 L62 40 L50 68 L38 40Z" fill="rgba(255,255,255,0.9)"/>
      <path d="M50 27 L62 40 L50 50 L38 40Z" fill="rgba(255,255,255,0.6)"/>
      <line x1="38" y1="40" x2="62" y2="40" stroke="#0c4a6e" strokeWidth="1" opacity="0.4"/>
      <path d="M38 40 L44 34 L56 34 L62 40" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
      <circle cx="57" cy="32" r="2.5" fill="#fde68a" opacity="0.95"/>
      <path d="M57 28 L57 30" stroke="#fde68a" strokeWidth="1.5"/>
      <path d="M55 30 L56.5 31.5" stroke="#fde68a" strokeWidth="1.5"/>
      <path d="M59 30 L57.5 31.5" stroke="#fde68a" strokeWidth="1.5"/>
    </>
  } />;
}
export function WhaleBadge({ size = 64 }: { size?: number }) {
  return <BadgeBase size={size} bg1="#38bdf8" bg2="#0369a1" icon={
    <>
      <path d="M20 56 Q32 40 54 48 Q70 43 78 53 Q72 59 60 57 Q50 64 36 59 Q26 61 20 56Z" fill="#fff" opacity="0.9"/>
      <circle cx="68" cy="50" r="2.5" fill="#0369a1"/>
      <path d="M38 47 Q40 32 43 26" fill="none" stroke="#bae6fd" strokeWidth="3" strokeLinecap="round"/>
      <path d="M42 26 Q46 20 44 26" fill="none" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round"/>
      <path d="M74 68 Q82 76 72 80 Q70 74 74 68Z" fill="#fff" opacity="0.6"/>
    </>
  } />;
}
export function CommunityBadge({ size = 64 }: { size?: number }) {
  return <BadgeBase size={size} bg1="#f472b6" bg2="#831843" icon={
    <>
      <circle cx="50" cy="34" r="9" fill="rgba(255,255,255,0.95)"/>
      <path d="M37 56 Q50 46 63 56 Q60 68 50 72 Q40 68 37 56Z" fill="rgba(255,255,255,0.9)"/>
      <circle cx="33" cy="40" r="7" fill="rgba(255,255,255,0.8)"/>
      <path d="M20 60 Q33 52 42 58" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="67" cy="40" r="7" fill="rgba(255,255,255,0.8)"/>
      <path d="M58 58 Q67 52 80 60" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round"/>
    </>
  } />;
}

/* ─────────────────────── THEMES ─────────────────────── */

export function ThemePreview({ colors, size = 64 }: { colors: string[]; size?: number }) {
  const slice = 360 / colors.length;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <circle cx="50" cy="50" r="46" fill="#111" />
      {colors.map((c, i) => {
        const start = i * slice * Math.PI / 180;
        const end = (i + 1) * slice * Math.PI / 180;
        const x1 = 50 + 44 * Math.cos(start), y1 = 50 + 44 * Math.sin(start);
        const x2 = 50 + 44 * Math.cos(end), y2 = 50 + 44 * Math.sin(end);
        return <path key={i} d={`M50,50 L${x1},${y1} A44,44 0 0,1 ${x2},${y2} Z`} fill={c} />;
      })}
      <circle cx="50" cy="50" r="20" fill="#111" />
      <circle cx="50" cy="50" r="18" fill="none" stroke="#333" strokeWidth="1" />
    </svg>
  );
}

const THEME_COLORS: Record<string, string[]> = {
  "theme-purple-night":  ["#7c3aed", "#1e1b4b", "#4c1d95", "#a78bfa"],
  "theme-ocean":         ["#0891b2", "#164e63", "#06b6d4", "#38bdf8"],
  "theme-sunset":        ["#dc2626", "#ea580c", "#fbbf24", "#f97316"],
  "theme-forest":        ["#16a34a", "#14532d", "#4ade80", "#166534"],
  "theme-cyberpunk":     ["#00ffe0", "#ff00ff", "#1a1a2e", "#7c3aed"],
  "theme-galaxy-dark":   ["#312e81", "#1e1b4b", "#818cf8", "#4338ca"],
  "theme-part-gold":     ["#f0b429", "#92400e", "#fde68a", "#b45309"],
  "theme-white-light":   ["#f8fafc", "#e2e8f0", "#94a3b8", "#cbd5e1"],
  "theme-cherry":        ["#ec4899", "#be185d", "#fda4af", "#f43f5e"],
  "theme-midnight":      ["#1e3a8a", "#0f172a", "#3b82f6", "#1d4ed8"],
};

/** imageUrl identifier → SVG bileşeni. HTTP URL ise direkt <img> render eder. */
export function StoreItemVisual({ name, kind, imageUrl, size = 64 }: {
  name: string; kind: string; imageUrl?: string; size?: number;
}) {
  // DiceBear veya dış URL → resmi olduğu gibi göster
  if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: "#1a1d2e", flexShrink: 0 }}>
        <img src={imageUrl} width={size} height={size} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={name} />
      </div>
    );
  }

  const id = (imageUrl ?? "").toLowerCase();
  const nm = name.toLowerCase();

  if (kind === "frame") {
    if (id.includes("diamond") || nm.includes("elmas"))     return <DiamondFrame size={size} />;
    if (id.includes("neon")    || nm.includes("neon"))      return <NeonFrame size={size} />;
    if (id.includes("fire")    || nm.includes("ateş"))      return <FireFrame size={size} />;
    if (id.includes("galaxy")  || nm.includes("galaksi"))   return <GalaxyFrame size={size} />;
    if (id.includes("rainbow") || nm.includes("gökkuşağı")) return <RainbowFrame size={size} />;
    if (id.includes("purple")  || nm.includes("mor"))       return <PurpleFrame size={size} />;
    if (id.includes("ice")     || nm.includes("buz"))       return <IceFrame size={size} />;
    if (id.includes("plasma")  || nm.includes("plazma"))    return <PlasmaFrame size={size} />;
    if (id.includes("hex")     || nm.includes("hex") || nm.includes("bnb")) return <HexFrame size={size} />;
    return <GoldFrame size={size} />;
  }

  if (kind === "avatar") {
    if (id.includes("bear")    || nm.includes("ayı") || nm.includes("ayıcık") || nm.includes("bear"))   return <BearAvatar size={size} />;
    if (id.includes("cat")     || nm.includes("kedi"))                               return <CatAvatar size={size} />;
    if (id.includes("fox")     || nm.includes("tilki"))                              return <FoxAvatar size={size} />;
    if (id.includes("bunny")   || nm.includes("tavşan"))                             return <BunnyAvatar size={size} />;
    if (id.includes("owl")     || nm.includes("baykuş"))                             return <OwlAvatar size={size} />;
    if (id.includes("dragon")  || nm.includes("ejderha"))                            return <DragonAvatar size={size} />;
    if (id.includes("panda")   || nm.includes("panda"))                              return <PandaAvatar size={size} />;
    if (id.includes("penguin") || nm.includes("penguen"))                            return <PenguinAvatar size={size} />;
    if (id.includes("robot")   || nm.includes("robot"))                              return <CuteRobotAvatar size={size} />;
    if (id.includes("koala")   || nm.includes("koala"))                              return <KoalaAvatar size={size} />;
    if (id.includes("wolf")    || nm.includes("kurt"))                               return <WolfAvatar size={size} />;
    if (id.includes("lion")    || nm.includes("aslan"))                              return <LionAvatar size={size} />;
    if (id.includes("unicorn") || nm.includes("unicorn") || nm.includes("tek boynuz")) return <UnicornAvatar size={size} />;
    if (id.includes("frog")    || nm.includes("kurbağa"))                            return <FrogAvatar size={size} />;
    if (id.includes("duck")    || nm.includes("ördek"))                              return <DuckAvatar size={size} />;
    if (id.includes("hamster") || nm.includes("hamster"))                            return <HamsterAvatar size={size} />;
    if (id.includes("horse")   || nm === "at" || nm.startsWith("at ") || nm.includes("🐴")) return <HorseAvatar size={size} />;
    if (id.includes("dog")     || nm.includes("köpek"))                              return <DogAvatar size={size} />;
    if (id.includes("tiger")   || nm.includes("kaplan"))                             return <TigerAvatar size={size} />;
    if (id.includes("turtle")  || nm.includes("kaplumbağa"))                         return <TurtleAvatar size={size} />;
    if (id.includes("eagle")   || nm.includes("kartal"))                             return <EagleAvatar size={size} />;
    if (id.includes("hedgehog")|| nm.includes("kirpi"))                              return <HedgehogAvatar size={size} />;
    if (id.includes("sheep")   || nm.includes("koyun"))                              return <SheepAvatar size={size} />;
    if (id.includes("monkey")  || nm.includes("maymun"))                             return <MonkeyAvatar size={size} />;
    if (id.includes("giraffe") || nm.includes("zürafa"))                             return <GiraffeAvatar size={size} />;
    if (id.includes("dolphin") || nm.includes("yunus"))                              return <DolphinAvatar size={size} />;
    if (id.includes("elephant")|| nm.includes("fil"))                                return <ElephantAvatar size={size} />;
    if (id.includes("deer")    || nm.includes("geyik"))                              return <DeerAvatar size={size} />;
    return <BearAvatar size={size} />;
  }

  if (kind === "badge") {
    if (id.includes("investor")      || nm.includes("yatırımcı"))      return <InvestorBadge size={size} />;
    if (id.includes("influencer")    || nm.includes("fenomen"))        return <InfluencerBadge size={size} />;
    if (id.includes("crypto")        || nm.includes("guru"))           return <CryptoBadge size={size} />;
    if (id.includes("bnb-og")        || nm.includes("bnb"))            return <BnbOgBadge size={size} />;
    if (id.includes("art")           || nm.includes("sanat"))          return <ArtBadge size={size} />;
    if (id.includes("reels")         || nm.includes("reels") || nm.includes("video")) return <ReelsBadge size={size} />;
    if (id.includes("early")         || nm.includes("erken"))          return <EarlyBadge size={size} />;
    if (id.includes("staking")       || nm.includes("stake") || nm.includes("staking")) return <StakingBadge size={size} />;
    if (id.includes("diamond-hands") || nm.includes("elmas el"))       return <DiamondHandsBadge size={size} />;
    if (id.includes("whale")         || nm.includes("balina"))         return <WhaleBadge size={size} />;
    if (id.includes("community")     || nm.includes("topluluk"))       return <CommunityBadge size={size} />;
    return <CreatorBadge size={size} />;
  }

  if (kind === "theme") {
    const colors = THEME_COLORS[id] ?? ["#888", "#333", "#555", "#444"];
    return <ThemePreview colors={colors} size={size} />;
  }

  return <CreatorBadge size={size} />;
}
