import dynamic from "next/dynamic";
const Gamification = dynamic(() => import("../../features/gamification/Gamification").then(m => ({ default: m.Gamification })), { ssr: false });
export default function LevelsPage() { return <Gamification />; }
export const metadata = { title: "Seviye & Ödüller — Saphara" };
