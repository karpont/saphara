import dynamic from "next/dynamic";
const Communities = dynamic(() => import("../../features/communities/Communities").then(m => ({ default: m.Communities })), { ssr: false });
export default function CommunitiesPage() { return <Communities />; }
export const metadata = { title: "Topluluklar — Saphara" };
