import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const COMMUNITIES = [
  { name: "BNB Yatırımcıları", slug: "bnb-yatirimcilari", description: "BNB Chain ekosistemi hakkında yatırım fikirleri ve analizler paylaşın.", imageUrl: "https://picsum.photos/seed/bnb-comm/200/200", private: false },
  { name: "PART Coin Topluluğu", slug: "part-coin", description: "Saphara'nın resmi PART token topluluğu. Haberler, güncellemeler ve tartışmalar.", imageUrl: "https://picsum.photos/seed/part-comm/200/200", private: false },
  { name: "Kripto Sanat & NFT", slug: "kripto-sanat-nft", description: "Dijital sanat eserlerinizi paylaşın, NFT koleksiyonlarınızı sergileyin.", imageUrl: "https://picsum.photos/seed/nft-art/200/200", private: false },
  { name: "DeFi Türkiye", slug: "defi-turkiye", description: "Merkeziyetsiz finans protokolleri, yield farming ve likidite havuzları.", imageUrl: "https://picsum.photos/seed/defi-tr/200/200", private: false },
  { name: "Web3 Geliştiriciler", slug: "web3-dev", description: "Akıllı sözleşme yazarları, dApp geliştiriciler ve blockchain uzmanları.", imageUrl: "https://picsum.photos/seed/web3dev/200/200", private: false },
  { name: "Kripto Haberler TR", slug: "kripto-haberler", description: "Güncel kripto para haberleri ve piyasa analizleri Türkçe olarak.", imageUrl: "https://picsum.photos/seed/crypto-news/200/200", private: false },
  { name: "GameFi & P2E", slug: "gamefi-p2e", description: "Blockchain oyunları, play-to-earn projeleri ve metaverse tartışmaları.", imageUrl: "https://picsum.photos/seed/gamefi/200/200", private: false },
  { name: "İçerik Üreticiler", slug: "icerik-ureticiler", description: "Sosyal medya içerik üreticileri için ipuçları, stratejiler ve iş birlikleri.", imageUrl: "https://picsum.photos/seed/creators/200/200", private: false },
  { name: "Saphara Elçileri", slug: "saphara-elcileri", description: "Saphara platformunu yaymak için gönüllü topluluk elçileri.", imageUrl: "https://picsum.photos/seed/ambassadors/200/200", private: false },
  { name: "VIP Yatırımcılar", slug: "vip-yatirimcilar", description: "Sadece davetliler için premium yatırım analizleri ve fırsatlar.", imageUrl: "https://picsum.photos/seed/vip-inv/200/200", private: true },
];

async function main() {
  console.log("Community seed başlıyor...");
  const existing = await prisma.community.count();
  if (existing >= COMMUNITIES.length) {
    console.log(`Zaten ${existing} topluluk mevcut, atlanıyor.`);
    return;
  }

  const creator = await prisma.user.findFirst({ where: { handle: "saphara" } });
  if (!creator) { console.error("saphara kullanıcısı bulunamadı"); return; }

  let count = 0;
  for (const c of COMMUNITIES) {
    const exists = await prisma.community.findFirst({ where: { slug: c.slug } });
    if (exists) continue;
    await prisma.community.create({
      data: {
        ...c,
        creatorId: creator.id,
        memberCount: Math.floor(Math.random() * 500) + 10,
        members: { create: { userId: creator.id, role: "admin" } },
      },
    });
    count++;
  }
  console.log(`✓ ${count} topluluk oluşturuldu`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
