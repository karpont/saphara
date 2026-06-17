/**
 * Çok kaynaklı haber servisi.
 * Kaynak öncelik sırası: CryptoPanic > CoinTelegraph/CoinDesk/Decrypt/TheBlock/BitcoinMag RSS > GNews > NewsData > HackerNews
 * Kripto haberleri için piyasa duyarlılığı analizi dahildir.
 */
export interface NewsItem {
    id: string;
    title: string;
    description?: string;
    url: string;
    imageUrl?: string;
    source: string;
    publishedAt: string;
    category?: string;
    sentiment?: "bullish" | "bearish" | "neutral";
    votes?: {
        positive: number;
        negative: number;
        important: number;
    };
    currencies?: string[];
}
export interface MarketAnalysis {
    sentiment: "bullish" | "bearish" | "neutral";
    sentimentScore: number;
    summary: string;
    topHeadlines: string[];
    fearGreedLabel: string;
    fearGreedValue: number;
    marketNote: string;
}
export declare function getMarketAnalysis(): Promise<MarketAnalysis>;
export declare function getNews(category?: string, lang?: string): Promise<NewsItem[]>;
