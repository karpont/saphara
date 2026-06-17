import { RequireAuth } from "../../features/auth/RequireAuth";
import { Bookmarks } from "../../features/bookmarks/Bookmarks";
export default function Page() { return <RequireAuth><Bookmarks /></RequireAuth>; }
