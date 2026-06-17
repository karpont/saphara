import { RequireAuth } from "../../features/auth/RequireAuth";
import { Settings } from "../../features/settings/Settings";
export default function Page() { return <RequireAuth><Settings /></RequireAuth>; }
