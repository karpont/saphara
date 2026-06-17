/**
 * İçerik moderasyonu: küfür, spam, scam ve hakaret tespiti.
 * Türkçe ve İngilizce kötü söylem listesi dahil.
 */
/* Yasal olarak engellenmiş kategori anahtar kelimeleri (Türkiye yasaları) */
const LEGAL_BANNED = [
    // Kumar (7258 sayılı Kanun - Türkiye'de yasal değil)
    "casino", "gambling", "kumarhane", "bahis", "illegal bet",
    // Pornografi (5651 sayılı Kanun)
    "porn", "pornografi", "pornographic", "xxx", "adult content",
    // Uyuşturucu (TCK 188-190)
    "uyuşturucu", "cocaine", "heroin", "drug deal", "uyuşturucu sat",
    // Silah ticareti
    "silah sat", "gun sale", "weapon sell", "illegal arms",
    // Dolandırıcılık / phishing
    "scam", "dolandırıcı", "phishing", "ponzi", "rug pull",
    // Exploit / hack
    "hack this", "exploit now", "zero day sale",
];
/* Açık kötü söylemler (normalize edilmiş) */
const BANNED_TR = [
    "orospu", "oç", "göt", "amk", "sik", "piç", "kahpe",
    "ibne", "lavuk", "gerizekalı", "sürtük", "fahişe", "yavşak",
    "orosbuçocuğu", "sikik", "amına", "amını", "götveren",
    "yarrak", "yarrağı", "manyak",
];
const BANNED_EN = [
    "fuck", "shit", "bitch", "cunt", "nigger", "faggot", "whore",
    "asshole", "bastard", "dick", "cock", "pussy", "motherfucker",
    "nigga", "slut", "retard",
];
/* Dolandırıcılık / scam desenleri */
const SCAM_PATTERNS = [
    /send\s+\d+\s+(bnb|eth|btc|usdt|part)/i,
    /gönder\s+\d+\s+(bnb|eth|btc|usdt|part)/i,
    /double\s+your\s+(crypto|bnb|eth|btc)/i,
    /iki\s+katına\s+çıkar/i,
    /free\s+(bnb|eth|btc|usdt)/i,
    /ücretsiz\s+(bnb|eth|btc|usdt|part)/i,
    /guaranteed\s+(profit|return)/i,
    /kesin\s+kazanç/i,
    /pump\s+and\s+dump/i,
];
/* Spam desenleri */
const SPAM_PATTERNS = [
    /(.)\1{8,}/, // aynı karakter 8+ tekrar: "aaaaaaa"
    /[A-Z]{15,}/, // 15+ büyük harf ardışık
    /(https?:\/\/\S+\s*){4,}/i, // 4+ link aynı gönderide
];
function normalize(text) {
    return text
        .toLowerCase()
        .replace(/[0oO]/g, "0")
        .replace(/[1iIl|]/g, "1")
        .replace(/[3eE]/g, "3")
        .replace(/[4aA@]/g, "4")
        .replace(/[5sS$]/g, "5")
        .replace(/[6bB]/g, "6")
        .replace(/[7tT]/g, "7")
        .replace(/[8]/g, "8")
        .replace(/\s+/g, " ")
        .trim();
}
export function moderate(text, maxLen = 2000) {
    if (!text || !text.trim())
        return { ok: true };
    if (text.length > maxLen) {
        return { ok: false, reason: "too_long", message: `Gönderi ${maxLen} karakteri aşamaz` };
    }
    const norm = normalize(text);
    const lower = text.toLowerCase();
    // Yasal engel kontrolü — orijinal metin üzerinde (casino, porn, uyuşturucu...)
    for (const word of LEGAL_BANNED) {
        if (lower.includes(word)) {
            return {
                ok: false,
                reason: "scam",
                message: "Bu içerik yasal düzenlemeler gereği yayınlanamaz.",
            };
        }
    }
    // Küfür kontrolü (normalize edilmiş metin)
    for (const word of [...BANNED_TR, ...BANNED_EN]) {
        if (norm.includes(word)) {
            return {
                ok: false,
                reason: "profanity",
                message: "İçerik topluluk kurallarını ihlal ediyor: uygunsuz dil tespit edildi",
            };
        }
    }
    // Scam kontrolü
    for (const pat of SCAM_PATTERNS) {
        if (pat.test(text)) {
            return {
                ok: false,
                reason: "scam",
                message: "Olası dolandırıcılık içeriği tespit edildi. Bu gönderi yayınlanamaz.",
            };
        }
    }
    // Spam kontrolü
    for (const pat of SPAM_PATTERNS) {
        if (pat.test(text)) {
            return {
                ok: false,
                reason: "spam",
                message: "Spam içerik tespit edildi. Lütfen normal şekilde yazın.",
            };
        }
    }
    return { ok: true };
}
