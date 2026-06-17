/**
 * Piyasa verileri servisi — PART token + BNB ağı.
 * Tüm API'ler ücretsiz, API anahtarı gerektirmiyor.
 * DexScreener: PART/BSC gerçek zamanlı fiyat
 * CoinGecko: BNB fiyat, kripto piyasa verileri
 */
export interface PartMarketData {
    priceUsd: number;
    priceChange24h: number;
    volume24h: number;
    liquidity: number;
    marketCap: number;
    pairAddress: string;
    dex: string;
    source: "dexscreener" | "fallback";
}
export interface BnbData {
    priceUsd: number;
    priceChange24h: number;
    volume24h: number;
    marketCap: number;
}
export interface CryptoTicker {
    symbol: string;
    name: string;
    priceUsd: number;
    change24h: number;
    volume24h: number;
    marketCap: number;
    image?: string;
}
/** GeckoTerminal → DexScreener → fallback zinciri (hepsi ücretsiz, API key yok) */
export declare function getPartMarketData(): Promise<PartMarketData>;
/** CoinGecko'dan BNB + top kripto verileri — ücretsiz, API anahtarı yok */
export declare function getBnbData(): Promise<BnbData>;
/** Top 10 kripto fiyatları — ücretsiz CoinGecko */
export declare function getTopCrypto(): Promise<CryptoTicker[]>;
/** PART fiyat geçmişi (7 gün) */
export declare function getPartPriceHistory(): Promise<{
    date: string;
    price: number;
}[]>;
