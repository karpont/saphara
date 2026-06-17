/**
 * İçerik Bot Servisi
 * Bot hesapları belirli aralıklarla güncel konu, PART coin ve
 * haberler hakkında otomatik gönderi paylaşır.
 * Picsum.photos'tan ücretsiz, seed bazlı görseller kullanılır.
 */
/** Bot posting servisi başlat */
export declare function startContentBot(): void;
/** Manuel tek çevrim (test için) */
export declare function runBotCycleOnce(count?: number): Promise<number>;
