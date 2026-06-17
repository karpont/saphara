import dynamic from "next/dynamic";
const WalletPage = dynamic(() => import("../../features/wallet/WalletPage").then((m) => ({ default: m.WalletPage })), { ssr: false });
export default function Page() { return <WalletPage />; }
