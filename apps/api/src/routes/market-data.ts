import type { FastifyInstance } from "fastify";
import { getPartMarketData, getBnbData, getTopCrypto, getPartPriceHistory } from "../services/market-data";

export async function registerMarketDataRoutes(app: FastifyInstance) {
  /** PART token piyasa verisi */
  app.get("/market-data/part", async () => {
    const [part, history] = await Promise.all([getPartMarketData(), getPartPriceHistory()]);
    return { ...part, history };
  });

  /** BNB piyasa verisi */
  app.get("/market-data/bnb", async () => getBnbData());

  /** Top 10 kripto */
  app.get("/market-data/crypto", async () => {
    const tickers = await getTopCrypto();
    return { items: tickers };
  });

  /** Genel piyasa özeti */
  app.get("/market-data/summary", async () => {
    const [part, bnb, crypto] = await Promise.all([
      getPartMarketData(),
      getBnbData(),
      getTopCrypto(),
    ]);
    return { part, bnb, topCrypto: crypto.slice(0, 5) };
  });
}
