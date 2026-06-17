import { RequireAuth } from "../../features/auth/RequireAuth";
import { CreatePost } from "../../features/create/CreatePost";
export default function Page() { return <RequireAuth><CreatePost /></RequireAuth>; }