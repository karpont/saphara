import type { FastifyInstance } from "fastify";
import { getNews, getMarketAnalysis } from "../services/news";

export async function registerNewsRoutes(app: FastifyInstance) {

  /* ── Haber listesi (kategori bazlı, cache'li) ─────────────── */
  app.get("/news", async (req) => {
    const { category, lang } = req.query as { category?: string; lang?: string };
    const items = await getNews(category ?? "general", lang ?? "tr");
    return { items, category: category ?? "general", count: items.length };
  });

  /* ── Kripto piyasa analizi + duyarlılık ───────────────────── */
  app.get("/news/market-analysis", async () => {
    const analysis = await getMarketAnalysis();
    return analysis;
  });
}
