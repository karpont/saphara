import { Profile } from "../../features/profile/Profile";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  return { title: `@${params.handle} — Saphara` };
}

export default function HandlePage({ params }: { params: { handle: string } }) {
  return <Profile handle={params.handle} />;
}
