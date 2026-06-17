import { RequireAuth } from "../../features/auth/RequireAuth";
import { Messages } from "../../features/messages/Messages";
export default function Page() { return <RequireAuth><Messages /></RequireAuth>; }