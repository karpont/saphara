import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const ITEMS = [
  // ── Avatarlar (15 sevimli karakter) ──
  { kind: "avatar", name: "Ayıcık",         imageUrl: "avatar-bear",    pricePart: "25",  priceUsd: 0.25 },
  { kind: "avatar", name: "Kedi",            imageUrl: "avatar-cat",     pricePart: "25",  priceUsd: 0.25 },
  { kind: "avatar", name: "Tilki",           imageUrl: "avatar-fox",     pricePart: "30",  priceUsd: 0.30 },
  { kind: "avatar", name: "Tavşan",          imageUrl: "avatar-bunny",   pricePart: "25",  priceUsd: 0.25 },
  { kind: "avatar", name: "Baykuş",          imageUrl: "avatar-owl",     pricePart: "35",  priceUsd: 0.35 },
  { kind: "avatar", name: "Ejderha",         imageUrl: "avatar-dragon",  pricePart: "60",  priceUsd: 0.60 },
  { kind: "avatar", name: "Panda",           imageUrl: "avatar-panda",   pricePart: "30",  priceUsd: 0.30 },
  { kind: "avatar", name: "Penguen",         imageUrl: "avatar-penguin", pricePart: "25",  priceUsd: 0.25 },
  { kind: "avatar", name: "Şirin Robot",     imageUrl: "avatar-robot",   pricePart: "45",  priceUsd: 0.45 },
  { kind: "avatar", name: "Koala",           imageUrl: "avatar-koala",   pricePart: "30",  priceUsd: 0.30 },
  { kind: "avatar", name: "Kurt",            imageUrl: "avatar-wolf",    pricePart: "40",  priceUsd: 0.40 },
  { kind: "avatar", name: "Aslan",           imageUrl: "avatar-lion",    pricePart: "50",  priceUsd: 0.50 },
  { kind: "avatar", name: "Unicorn",         imageUrl: "avatar-unicorn", pricePart: "80",  priceUsd: 0.80 },
  { kind: "avatar", name: "Kurbağa",         imageUrl: "avatar-frog",    pricePart: "20",  priceUsd: 0.20 },
  { kind: "avatar", name: "Ördek",           imageUrl: "avatar-duck",    pricePart: "20",  priceUsd: 0.20 },
  { kind: "avatar", name: "Hamster",         imageUrl: "avatar-hamster", pricePart: "20",  priceUsd: 0.20 },

  // ── Çerçeveler (10 farklı) ──
  { kind: "frame", name: "Altın Çerçeve",      imageUrl: "frame-gold",    pricePart: "50",  priceUsd: 0.50 },
  { kind: "frame", name: "Elmas Çerçeve",      imageUrl: "frame-diamond", pricePart: "100", priceUsd: 1.00 },
  { kind: "frame", name: "Mor Çerçeve",        imageUrl: "frame-purple",  pricePart: "40",  priceUsd: 0.40 },
  { kind: "frame", name: "Neon Çerçeve",       imageUrl: "frame-neon",    pricePart: "60",  priceUsd: 0.60 },
  { kind: "frame", name: "Ateş Çerçeve",       imageUrl: "frame-fire",    pricePart: "70",  priceUsd: 0.70 },
  { kind: "frame", name: "Galaksi Çerçeve",    imageUrl: "frame-galaxy",  pricePart: "80",  priceUsd: 0.80 },
  { kind: "frame", name: "Gökkuşağı Çerçeve", imageUrl: "frame-rainbow", pricePart: "55",  priceUsd: 0.55 },
  { kind: "frame", name: "Buz Çerçeve",        imageUrl: "frame-ice",     pricePart: "45",  priceUsd: 0.45 },
  { kind: "frame", name: "Plazma Çerçeve",     imageUrl: "frame-plasma",  pricePart: "75",  priceUsd: 0.75 },
  { kind: "frame", name: "BNB Hex Çerçeve",    imageUrl: "frame-hex",     pricePart: "90",  priceUsd: 0.90 },

  // ── Rozetler (12 farklı) ──
  { kind: "badge", name: "İlk Katılan",      imageUrl: "badge-early",         pricePart: "0",   priceUsd: 0 },
  { kind: "badge", name: "İçerik Üreticisi", imageUrl: "badge-creator",       pricePart: "0",   priceUsd: 0 },
  { kind: "badge", name: "Yatırımcı",        imageUrl: "badge-investor",      pricePart: "200", priceUsd: 2.00 },
  { kind: "badge", name: "Fenomen",          imageUrl: "badge-influencer",    pricePart: "300", priceUsd: 3.00 },
  { kind: "badge", name: "Kripto Guru",      imageUrl: "badge-crypto",        pricePart: "150", priceUsd: 1.50 },
  { kind: "badge", name: "BNB OG",           imageUrl: "badge-bnb-og",        pricePart: "500", priceUsd: 5.00 },
  { kind: "badge", name: "Sanat Koleksiyoncusu", imageUrl: "badge-art",       pricePart: "100", priceUsd: 1.00 },
  { kind: "badge", name: "Reels Yıldızı",   imageUrl: "badge-reels",         pricePart: "0",   priceUsd: 0 },
  { kind: "badge", name: "Staking Uzmanı",   imageUrl: "badge-staking",       pricePart: "250", priceUsd: 2.50 },
  { kind: "badge", name: "Elmas El",         imageUrl: "badge-diamond-hands", pricePart: "400", priceUsd: 4.00 },
  { kind: "badge", name: "Balina",           imageUrl: "badge-whale",         pricePart: "1000",priceUsd: 10.00 },
  { kind: "badge", name: "Topluluk Lideri",  imageUrl: "badge-community",     pricePart: "200", priceUsd: 2.00 },

  // ── Temalar (10 farklı) ──
  { kind: "theme", name: "Mor Gece",     imageUrl: "theme-purple-night", pricePart: "30",  priceUsd: 0.30 },
  { kind: "theme", name: "Okyanus",      imageUrl: "theme-ocean",        pricePart: "30",  priceUsd: 0.30 },
  { kind: "theme", name: "Gün Batımı",   imageUrl: "theme-sunset",       pricePart: "30",  priceUsd: 0.30 },
  { kind: "theme", name: "Orman",        imageUrl: "theme-forest",       pricePart: "30",  priceUsd: 0.30 },
  { kind: "theme", name: "Siber Punk",   imageUrl: "theme-cyberpunk",    pricePart: "50",  priceUsd: 0.50 },
  { kind: "theme", name: "Galaksi Karanlık", imageUrl: "theme-galaxy-dark", pricePart: "50", priceUsd: 0.50 },
  { kind: "theme", name: "PART Altın",   imageUrl: "theme-part-gold",    pricePart: "100", priceUsd: 1.00 },
  { kind: "theme", name: "Beyaz Işık",   imageUrl: "theme-white-light",  pricePart: "20",  priceUsd: 0.20 },
  { kind: "theme", name: "Kiraz",        imageUrl: "theme-cherry",       pricePart: "40",  priceUsd: 0.40 },
  { kind: "theme", name: "Gece Mavisi",  imageUrl: "theme-midnight",     pricePart: "40",  priceUsd: 0.40 },
];

async function main() {
  console.log("Store seed başlıyor...");
  let created = 0;
  for (const item of ITEMS) {
    const exists = await prisma.storeItem.findFirst({
      where: { name: item.name, kind: item.kind }
    });
    if (exists) continue;
    await prisma.storeItem.create({ data: item as any });
    created++;
  }
  console.log(`✓ ${created} yeni ürün, toplam ${ITEMS.length} ürün`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
