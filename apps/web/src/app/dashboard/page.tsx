import dynamic from "next/dynamic";
import { RequireAuth } from "../../features/auth/RequireAuth";

const Dashboard = dynamic(
  () => import("../../features/dashboard/Dashboard").then((m) => ({ default: m.Dashboard })),
  { ssr: false }
);

export default function Page() {
  return <RequireAuth><Dashboard /></RequireAuth>;
}
