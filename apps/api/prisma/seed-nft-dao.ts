/**
 * NFT koleksiyonları, DAO teklifleri ve örnek topluluklar için seed verisi.
 * Çalıştır: npx ts-node prisma/seed-nft-dao.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const RARITY_WEIGHTS = [
  { rarity: "legendary", weight: 1 },
  { rarity: "epic",      weight: 4 },
  { rarity: "rare",      weight: 15 },
  { rarity: "uncommon",  weight: 30 },
  { rarity: "common",    weight: 50 },
];
function rollRarity() {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const r of RARITY_WEIGHTS) {
    cumulative += r.weight;
    if (roll <= cumulative) return r.rarity;
  }
  return "common";
}
function attrs(rarity: string) {
  const bgs  = ["Cosmic","Forest","Ocean","Desert","Neon","Void","Aurora"];
  const eyes = ["Laser","Diamond","Normal","Sleepy","Wild","Closed","Glowing"];
  const acc  = ["Crown","Glasses","Hat","None","Chain","Earring","Mask"];
  const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];
  return [
    { trait_type:"Background", value: pick(bgs)  },
    { trait_type:"Eyes",       value: pick(eyes) },
    { trait_type:"Accessory",  value: pick(acc)  },
    { trait_type:"Rarity",     value: rarity     },
  ];
}

async function main() {
  console.log("NFT / DAO seed başlıyor…");

  /* ── Ensure base users exist ──────────────────────────────── */
  const saphara = await prisma.user.upsert({
    where:  { handle: "saphara" },
    update: {},
    create: {
      handle: "saphara", name: "Saphara", verified: true,
      bio: "Resmi Saphara hesabı.",
      avatarUrl: "https://api.dicebear.com/9.x/bottts/svg?seed=saphara",
      walletAddress: "0x55B26f8CD67632d7AF9a888c645054Ca76E53455",
      earningsPart: "99999",
    },
  });

  const creator = await prisma.user.upsert({
    where:  { handle: "creator" },
    update: {},
    create: {
      handle: "creator", name: "Saphara Üretici", verified: true,
      bio: "Video & dijital sanat üreticisi.",
      avatarUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=creator",
      walletAddress: "0x1111111111111111111111111111111111111111",
      earningsPart: "5000",
    },
  });

  const artist = await prisma.user.upsert({
    where:  { handle: "artist" },
    update: {},
    create: {
      handle: "artist", name: "Dijital Sanatçı",
      bio: "NFT & dijital sanat koleksiyonları.",
      avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=artist",
      walletAddress: "0x2222222222222222222222222222222222222222",
      earningsPart: "2000",
    },
  });

  /* ── NFT Collections ──────────────────────────────────────── */
  const collections = [
    {
      name: "Saphara Genesis",
      symbol: "SGEN",
      description: "Saphara platformunun kurucu üyeleri için özel koleksiyon. Sadece 500 adet basılacak Genesis NFT, DAO oylarında 2x güç ve özel rozetler verir.",
      imageUrl: "https://api.dicebear.com/9.x/bottts/svg?seed=sgen-cover&size=400",
      bannerUrl: "https://picsum.photos/seed/sgen-banner/1200/300",
      mintPrice: "100",
      whitelistPrice: "60",
      maxSupply: 500,
      maxPerWallet: 3,
      royaltyPct: "5",
      status: "active",
      chain: "BSC",
      creatorId: saphara.id,
    },
    {
      name: "CyberBot Society",
      symbol: "CBS",
      description: "Dijital dünyaya adapt olmuş 1000 benzersiz CyberBot. Her biri farklı özellikler ve raritylerle gelir. BSC üzerinde kanıtlanmış sahiplik.",
      imageUrl: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=cbs-cover&size=400",
      bannerUrl: "https://picsum.photos/seed/cbs-banner/1200/300",
      mintPrice: "75",
      whitelistPrice: "45",
      maxSupply: 1000,
      maxPerWallet: 5,
      royaltyPct: "3",
      status: "active",
      chain: "BSC",
      creatorId: creator.id,
    },
    {
      name: "Lorelei Legends",
      symbol: "LORE",
      description: "Mitolojik karakterlerden ilham alan sanatsal koleksiyon. 777 el çizimi NFT, her biri unique metadata ile güçlendirilmiş.",
      imageUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=lore-cover&size=400",
      bannerUrl: "https://picsum.photos/seed/lore-banner/1200/300",
      mintPrice: "150",
      whitelistPrice: "90",
      maxSupply: 777,
      maxPerWallet: 2,
      royaltyPct: "7.5",
      status: "active",
      chain: "BSC",
      creatorId: artist.id,
    },
    {
      name: "Pixel Adventurers",
      symbol: "PADV",
      description: "Retro piksel sanat tarzında 2000 benzersiz kahraman. Her adventurer farklı sınıf, silah ve zırh kombinasyonuna sahip. Yakında oyun entegrasyonu!",
      imageUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=padv-cover&size=400",
      bannerUrl: "https://picsum.photos/seed/padv-banner/1200/300",
      mintPrice: "50",
      whitelistPrice: "30",
      maxSupply: 2000,
      maxPerWallet: 10,
      royaltyPct: "2.5",
      status: "active",
      chain: "BSC",
      creatorId: creator.id,
    },
    {
      name: "Abstract Minds",
      symbol: "ABST",
      description: "Soyut yapay zeka sanatı ile üretilmiş özel koleksiyon. Yakında basılacak — şimdi whitelist'e katıl!",
      imageUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=abst-cover&size=400",
      bannerUrl: "https://picsum.photos/seed/abst-banner/1200/300",
      mintPrice: "200",
      whitelistPrice: "120",
      maxSupply: 300,
      maxPerWallet: 1,
      royaltyPct: "10",
      status: "upcoming",
      chain: "BSC",
      creatorId: artist.id,
    },
  ];

  const createdCollections: any[] = [];
  for (const col of collections) {
    const existing = await prisma.nftCollection.findFirst({ where: { symbol: col.symbol } });
    if (existing) { createdCollections.push(existing); continue; }
    const c = await prisma.nftCollection.create({ data: col as any });
    createdCollections.push(c);
    console.log(`NFT collection created: ${c.name}`);
  }

  /* ── Mint some example tokens for active collections ──────── */
  for (const col of createdCollections.filter(c => c.status === "active")) {
    const existingCount = await prisma.nftToken.count({ where: { collectionId: col.id } });
    if (existingCount >= 5) continue;

    const styles = ["bottts","adventurer","lorelei","bottts-neutral","shapes"];
    const styleIdx = createdCollections.indexOf(col) % styles.length;
    const style = styles[styleIdx];

    for (let i = 1; i <= 5; i++) {
      const rarity = rollRarity();
      await prisma.nftToken.upsert({
        where: { collectionId_tokenId: { collectionId: col.id, tokenId: i } },
        update: {},
        create: {
          tokenId: i,
          collectionId: col.id,
          ownerId: col.creatorId,
          minterId: col.creatorId,
          name: `${col.name} #${i}`,
          description: `${col.name} koleksiyonundan #${i} numaralı token`,
          imageUrl: `https://api.dicebear.com/9.x/${style}/svg?seed=${col.symbol}-${i}&size=200`,
          rarity,
          attributes: attrs(rarity),
        },
      });
    }

    await prisma.nftCollection.update({
      where: { id: col.id },
      data: { minted: 5 },
    });
    console.log(`Minted 5 tokens for: ${col.name}`);
  }

  /* ── DAO Proposals ────────────────────────────────────────── */
  const proposals = [
    {
      title: "Platform Komisyonunu %2.5'ten %2'ye Düşür",
      description: "Saphara market komisyonu şu anda %2.5. Bu teklifte, NFT ve dijital ürün satışlarındaki platform komisyonunu %2'ye düşürmeyi öneriyoruz. Bu değişiklik satıcıları platformda tutmaya teşvik eder ve işlem hacmini artırır. Kullanıcı dostu komisyon oranı ile rekabetçi avantaj kazanırız.",
      type: "parameter",
      status: "active",
      votesFor: 1240,
      votesAgainst: 380,
      votesAbstain: 95,
      quorum: 50,
      passThreshold: 60,
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      tags: ["komisyon", "market", "ekonomi"],
      authorId: creator.id,
    },
    {
      title: "Referral Ödülünü 50'den 75 PART'a Çıkar",
      description: "Her başarılı referral için verilen 50 PART ödülünü 75 PART'a yükseltmeyi öneriyoruz. Mevcut kullanıcı büyüme hızına bakıldığında, daha cazip bir referral ödülü organik büyümeyi hızlandırabilir. Bütçe: Aylık maksimum 50.000 PART.",
      type: "parameter",
      status: "active",
      votesFor: 890,
      votesAgainst: 220,
      votesAbstain: 45,
      quorum: 40,
      passThreshold: 55,
      endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      tags: ["referral", "büyüme", "ödül"],
      authorId: saphara.id,
    },
    {
      title: "DAO Treasury'den NFT Sanatçı Fonu Oluştur",
      description: "Platform hazinesinden 10.000 PART tahsis ederek bağımsız NFT sanatçılarını desteklemek istiyoruz. Başvuruları DAO üyeleri değerlendirecek, kabul edilen sanatçılara 500-2000 PART arasında hibe verilecek. Bu fon Saphara'nın içerik kalitesini artıracak.",
      type: "treasury",
      status: "active",
      votesFor: 567,
      votesAgainst: 445,
      votesAbstain: 120,
      quorum: 60,
      passThreshold: 65,
      endsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      treasuryAmount: 10000,
      tags: ["hazine", "nft", "sanat", "hibe"],
      authorId: artist.id,
    },
    {
      title: "Staking Sistemi: PART Kilitleme ve APY",
      description: "Saphara'ya staking özelliği eklensin: Kullanıcılar PART kilitleyerek yıllık %15-25 APY kazansın. 30/60/90 günlük kilit seçenekleri sunulsun. Erken çıkış için %5 ceza uygulanır. Bu mekanizma token sirkülasyonunu azaltarak fiyat istikrarı sağlar.",
      type: "feature",
      status: "passed",
      votesFor: 2100,
      votesAgainst: 340,
      votesAbstain: 89,
      quorum: 50,
      passThreshold: 60,
      endsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      tags: ["staking", "defi", "apy"],
      authorId: saphara.id,
    },
    {
      title: "Topluluk Moderatörleri için Aylık PART Ödülü",
      description: "Aktif topluluk moderatörleri her ay 100 PART ödül alsın. Moderatör kriterleri: aylık en az 20 içerik moderasyonu, 90%+ doğru karar oranı. Bu ödül sistemi moderasyon kalitesini ve platformun güvenliğini artırır.",
      type: "general",
      status: "rejected",
      votesFor: 420,
      votesAgainst: 680,
      votesAbstain: 150,
      quorum: 50,
      passThreshold: 60,
      endsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      tags: ["moderasyon", "ödül", "topluluk"],
      authorId: creator.id,
    },
  ];

  for (const p of proposals) {
    const existing = await prisma.daoProposal.findFirst({ where: { title: p.title } });
    if (existing) continue;
    await prisma.daoProposal.create({ data: p as any });
    console.log(`DAO proposal created: ${p.title.slice(0, 40)}…`);
  }

  /* ── Extended Communities (real-like) ────────────────────── */
  const communities = [
    {
      slug: "kripto-turkiye",
      name: "Kripto Türkiye",
      description: "Türkiye'nin en büyük kripto para topluluğu. Bitcoin, Ethereum, BNB Chain ve altcoin tartışmaları, haberler ve analizler.",
      imageUrl: "https://api.dicebear.com/9.x/identicon/svg?seed=kripto-turkiye",
      coverUrl: "https://picsum.photos/seed/kripto-tr/1200/300",
      private: false,
      memberCount: 12840,
      creatorId: saphara.id,
    },
    {
      slug: "nft-collectors",
      name: "NFT Collectors",
      description: "NFT alım-satım stratejileri, nadir koleksiyonlar, whitelist fırsatları ve piyasa analizleri. Türkiye'nin NFT toplumu burada!",
      imageUrl: "https://api.dicebear.com/9.x/identicon/svg?seed=nft-collectors",
      coverUrl: "https://picsum.photos/seed/nft-coll/1200/300",
      private: false,
      memberCount: 5630,
      creatorId: artist.id,
    },
    {
      slug: "bnb-defi",
      name: "BNB DeFi Hub",
      description: "BNB Chain üzerindeki DeFi protokolleri: PancakeSwap, Venus, Alpaca Finance ve daha fazlası. Yield farming ve liquidity mining rehberleri.",
      imageUrl: "https://api.dicebear.com/9.x/identicon/svg?seed=bnb-defi",
      coverUrl: "https://picsum.photos/seed/bnb-defi/1200/300",
      private: false,
      memberCount: 8920,
      creatorId: creator.id,
    },
    {
      slug: "part-holders",
      name: "PART Holders",
      description: "PART token sahiplerinin resmi topluluğu. Fiyat analizi, DAO gündemleri, platform güncellemeleri ve holder avantajları.",
      imageUrl: "https://api.dicebear.com/9.x/identicon/svg?seed=part-holders",
      coverUrl: "https://picsum.photos/seed/part-hold/1200/300",
      private: false,
      memberCount: 4210,
      creatorId: saphara.id,
    },
    {
      slug: "web3-creators",
      name: "Web3 Creators",
      description: "Web3 içerik üreticileri için özel alan. İçerik monetizasyonu, NFT stratejileri, audience building ve kripto kazanma ipuçları.",
      imageUrl: "https://api.dicebear.com/9.x/identicon/svg?seed=web3-creators",
      coverUrl: "https://picsum.photos/seed/web3-cr/1200/300",
      private: false,
      memberCount: 3150,
      creatorId: creator.id,
    },
    {
      slug: "saphara-dao",
      name: "Saphara DAO",
      description: "Platform yönetişim toplantıları, teklif tartışmaları ve oy rehberleri. DAO üyesi ol, Saphara'nın geleceğini şekillendir.",
      imageUrl: "https://api.dicebear.com/9.x/identicon/svg?seed=saphara-dao",
      coverUrl: "https://picsum.photos/seed/saphara-dao/1200/300",
      private: false,
      memberCount: 2680,
      creatorId: saphara.id,
    },
    {
      slug: "trading-signals",
      name: "Trading Signals TR",
      description: "Kripto trading sinyalleri, teknik analiz paylaşımı ve piyasa yorumları. Ücretsiz giriş seviyesi, premium ücretli sinyal kanalı.",
      imageUrl: "https://api.dicebear.com/9.x/identicon/svg?seed=trading-signals",
      coverUrl: "https://picsum.photos/seed/trading-sig/1200/300",
      private: false,
      memberCount: 9870,
      creatorId: creator.id,
    },
  ];

  for (const comm of communities) {
    const existing = await prisma.community.findUnique({ where: { slug: comm.slug } });
    if (existing) { continue; }
    await prisma.community.create({ data: comm as any });
    console.log(`Community created: ${comm.name}`);
  }

  /* ── Referral codes for base users ───────────────────────── */
  for (const user of [saphara, creator, artist]) {
    await prisma.userStats.upsert({
      where:  { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        referralCode: `REF-${user.id.slice(-8).toUpperCase()}`,
        xp: user.handle === "saphara" ? 9999 : 500,
        level: user.handle === "saphara" ? 50 : 5,
      },
    });
  }

  console.log("NFT / DAO seed tamamlandı ✓");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
