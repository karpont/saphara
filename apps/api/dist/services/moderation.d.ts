/**
 * İçerik moderasyonu: küfür, spam, scam ve hakaret tespiti.
 * Türkçe ve İngilizce kötü söylem listesi dahil.
 */
export type ModerationResult = {
    ok: true;
} | {
    ok: false;
    reason: "profanity" | "scam" | "spam" | "too_long";
    message: string;
};
export declare function moderate(text: string, maxLen?: number): ModerationResult;
