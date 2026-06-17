import type { Metadata } from "next";
import { PartCoinPage } from "../../features/part/PartCoinPage";

export const metadata: Metadata = {
  title: "PART Coin — Saphara'nın Kripto Parası",
  description: "BNB Smart Chain üzerinde Saphara platformunun yerel token'ı. İçerik üret, bahşiş al, market'te harca.",
};

export default function PartPage() {
  return <PartCoinPage />;
}
