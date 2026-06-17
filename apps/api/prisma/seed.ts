import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed basliyor…");

  // ─── Kullanicilar ───
  const saphara = await prisma.user.upsert({
    where: { handle: "saphara" },
    update: { avatarUrl: "https://i.pravatar.cc/150?img=10", verified: true },
    create: {
      handle: "saphara", name: "Saphara", verified: true,
      bio: "Resmi Saphara hesabi. Olustur, paylas, kazan.",
      avatarUrl: "https://i.pravatar.cc/150?img=10",
      walletAddress: "0x55B26f8CD67632d7AF9a888c645054Ca76E53455",
    },
  });

  const creator = await prisma.user.upsert({
    where: { handle: "creator" },
    update: { avatarUrl: "https://i.pravatar.cc/150?img=32", verified: true },
    create: {
      handle: "creator", name: "Saphara Uretici", verified: true,
      bio: "Video & muzik ureticisi. PART ile destek olabilirsin.",
      avatarUrl: "https://i.pravatar.cc/150?img=32",
      earningsPart: "3120",
      walletAddress: "0x1111111111111111111111111111111111111111",
    },
  });

  const artist = await prisma.user.upsert({
    where: { handle: "artist" },
    update: { avatarUrl: "https://i.pravatar.cc/150?img=47" },
    create: {
      handle: "artist", name: "Dijital Sanatci", bio: "NFT & dijital sanat.",
      avatarUrl: "https://i.pravatar.cc/150?img=47",
      walletAddress: "0x2222222222222222222222222222222222222222",
    },
  });

  // ─── Takip iliskisi ───
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: creator.id, followingId: saphara.id } },
    update: {},
    create: { followerId: creator.id, followingId: saphara.id },
  });

  // ─── Gonderiler ───
  const postTexts = [
    { authorId: saphara.id, text: "🌟 Saphara'ya hoş geldin! Cüzdanını bağla, PART ile içerik üret ve kazan. BNB Chain üzerinde en iyi kripto sosyal ağı. #Saphara #PART #BNB", qualityScore: 0.95, likes: 12400, repostCount: 840 },
    { authorId: saphara.id, text: "💰 PART coin ile platform içinde ödeme yap! Bahşiş gönder, market'ten alışveriş yap, özel içeriklerin kilidini aç. Sadece Saphara'da. #PART #Kripto", qualityScore: 0.9, likes: 8900, repostCount: 620 },
    { authorId: creator.id, text: "🎬 Yeni Reels yükledim! Tarayıcıdan keserek düzenledim, harici uygulama gerekmedi. Saphara Studio gerçekten harika! #Reels #Studio", qualityScore: 0.85, likes: 5320, repostCount: 380 },
    { authorId: creator.id, text: "PART kazanmak isteyenler için ipucu: Kaliteli içerik + düzenli paylaşım = takipçi büyümesi = bahşiş geliri 🚀 #PARTKazan", qualityScore: 0.8, likes: 3200, repostCount: 290 },
    { authorId: artist.id, text: "🎨 Yeni dijital sanat koleksiyonum market'te! PART ile sahip ol, NFT gibi değerli. #DigitalArt #NFT #PART", qualityScore: 0.78, likes: 2100, repostCount: 180 },
    { authorId: artist.id, text: "Kripto dünyası + sosyal medya = Saphara! Web3'ü herkes için erişilebilir kılıyoruz. @saphara ile blockchain sosyalleşiyor 🔗 #Blockchain #Web3", qualityScore: 0.75, likes: 1800, repostCount: 150 },
  ];

  for (const pt of postTexts) {
    const existing = await prisma.post.findFirst({ where: { authorId: pt.authorId, text: pt.text } });
    if (existing) continue;
    const post = await prisma.post.create({ data: pt });
    const tags = [...new Set((pt.text.match(/#[\wÀ-ɏ]+/g) ?? []).map((t: string) => t.slice(1).toLowerCase()))];
    for (const tag of tags) {
      const ht = await prisma.hashtag.upsert({
        where: { tag }, update: { postCount: { increment: 1 } }, create: { tag, postCount: 1 },
      });
      await prisma.postHashtag.upsert({
        where: { postId_hashtagId: { postId: post.id, hashtagId: ht.id } },
        update: {}, create: { postId: post.id, hashtagId: ht.id },
      });
    }
  }

  // ─── Reklam Kampanyalari (en az 7) ───
  const campaignCount = await prisma.campaign.count({ where: { advertiserId: saphara.id } });
  if (campaignCount < 7) {
    const existing = await prisma.campaign.findMany({ where: { advertiserId: saphara.id }, select: { name: true } });
    const existingNames = new Set(existing.map((c) => c.name));

    const campaigns = [
      {
        name: "PART Coin — BNB Chain'in Sosyal Parası",
        objective: "awareness", budgetPart: "10000", bidPart: "5", budgetRemaining: "10000",
        interests: ["Kripto", "DeFi", "NFT", "BNB"],
        headline: "💰 PART Coin ile Sosyal Medyada Kazan!",
        mediaUrl: "https://picsum.photos/seed/part-coin/800/400",
        cta: "PART Coin Hakkında", status: "active",
      },
      {
        name: "Saphara — BNB Chain Sosyal Ağı",
        objective: "traffic", budgetPart: "15000", bidPart: "7", budgetRemaining: "15000",
        interests: ["Kripto", "Sosyal Medya", "NFT", "Teknoloji"],
        headline: "🌟 Saphara: Kazan, Paylaş, Bağlan!",
        mediaUrl: "https://picsum.photos/seed/saphara-platform/800/400",
        cta: "Ücretsiz Kaydol", status: "active",
      },
      {
        name: "İçerik Üreticileri — PART ile Kazan",
        objective: "conversions", budgetPart: "8000", bidPart: "6", budgetRemaining: "8000",
        interests: ["İçerik Üretimi", "Video", "Reels", "Kripto"],
        headline: "🎬 İçerik Yükle, PART Kazan!",
        mediaUrl: "https://picsum.photos/seed/creator-earn/800/400",
        cta: "Üretmeye Başla", status: "active",
      },
      {
        name: "BNB Chain OG Kampanyası",
        objective: "awareness", budgetPart: "12000", bidPart: "8", budgetRemaining: "12000",
        interests: ["BNB", "DeFi", "Blockchain", "Kripto"],
        headline: "⚡ BNB Chain'in En İyi Sosyal Ağı Saphara!",
        mediaUrl: "https://picsum.photos/seed/bnb-og/800/400",
        cta: "BNB ile Bağlan", status: "active",
      },
      {
        name: "NFT & Dijital Sanat Pazarı",
        objective: "traffic", budgetPart: "6000", bidPart: "4", budgetRemaining: "6000",
        interests: ["NFT", "DigitalArt", "Koleksiyon", "Kripto"],
        headline: "🎨 Dijital Sanatını Sat, NFT Kazan!",
        mediaUrl: "https://picsum.photos/seed/nft-art/800/400",
        cta: "Market'i Keşfet", status: "active",
      },
      {
        name: "Premium Mağaza — Profil Özelleştirme",
        objective: "conversions", budgetPart: "5000", bidPart: "3", budgetRemaining: "5000",
        interests: ["Sosyal Medya", "Profil", "Kripto", "Oyun"],
        headline: "✨ Profilini Özelleştir, Öne Çık!",
        mediaUrl: "https://picsum.photos/seed/premium-store/800/400",
        cta: "Mağazayı Gör", status: "active",
      },
      {
        name: "DeFi & Web3 Eğitim Kampanyası",
        objective: "awareness", budgetPart: "4000", bidPart: "3", budgetRemaining: "4000",
        interests: ["DeFi", "Web3", "Blockchain", "Eğitim"],
        headline: "📚 DeFi'yi Öğren, Web3'e Adım At!",
        mediaUrl: "https://picsum.photos/seed/defi-edu/800/400",
        cta: "Hemen Öğren", status: "active",
      },
    ];

    for (const c of campaigns) {
      if (existingNames.has(c.name)) continue;
      await prisma.campaign.create({
        data: { ...c, advertiserId: saphara.id, impressions: 0, clicks: 0, spentPart: "0" },
      });
    }
    console.log("Reklam kampanyalari guncellendi");
  }

  // ─── Reels (en az 10) ───
  const reelCount = await prisma.reel.count();
  if (reelCount < 10) {
    const reelsToAdd = [
      {
        authorId: saphara.id,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        posterUrl: "https://picsum.photos/seed/reel1/400/700",
        caption: "Saphara Reels'e hoş geldin 🎬 #Saphara #Reels",
        sound: "Orijinal ses", likes: 12400, views: 98000,
      },
      {
        authorId: creator.id,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        posterUrl: "https://picsum.photos/seed/reel2/400/700",
        caption: "Tarayıcıdan kestim — Saphara Studio 🎬 #Studio",
        sound: "Trend müzik", likes: 8900, views: 64000,
      },
      {
        authorId: artist.id,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        posterUrl: "https://picsum.photos/seed/reel3/400/700",
        caption: "Dijital sanat dünyasından 🎨 #NFT #DigitalArt",
        sound: "Lo-fi beats", likes: 6200, views: 41000,
      },
      {
        authorId: saphara.id,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
        posterUrl: "https://picsum.photos/seed/reel4/400/700",
        caption: "BNB Chain üzerinde özgürlük 🚀 #BNBChain #PART",
        sound: "Orijinal ses", likes: 5100, views: 37000,
      },
      {
        authorId: creator.id,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        posterUrl: "https://picsum.photos/seed/reel5/400/700",
        caption: "PART ile kazan, Saphara ile büyü 💰 #PARTKazan",
        sound: "Epic soundtrack", likes: 4300, views: 29000,
      },
      {
        authorId: artist.id,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
        posterUrl: "https://picsum.photos/seed/reel6/400/700",
        caption: "Kripto dünyasına hoş geldin 🌐 #Kripto #Web3",
        sound: "Chill vibes", likes: 3800, views: 24000,
      },
      {
        authorId: saphara.id,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        posterUrl: "https://picsum.photos/seed/reel7/400/700",
        caption: "Finansal özgürlüğe giden yol 💎 #DeFi #BNB",
        sound: "Motivasyon müziği", likes: 7200, views: 52000,
      },
      {
        authorId: creator.id,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        posterUrl: "https://picsum.photos/seed/reel8/400/700",
        caption: "Sosyal medya + kripto = Saphara 🔥 #Saphara #Kripto",
        sound: "Fun beat", likes: 9100, views: 71000,
      },
      {
        authorId: artist.id,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        posterUrl: "https://picsum.photos/seed/reel9/400/700",
        caption: "NFT koleksiyonum artık Saphara'da! 🎨 #NFT #Art",
        sound: "Lo-fi chill", likes: 3400, views: 19000,
      },
      {
        authorId: saphara.id,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        posterUrl: "https://picsum.photos/seed/reel10/400/700",
        caption: "PART token fırlatıyor 🚀🌕 #PART #ToTheMoon",
        sound: "Hype music", likes: 15600, views: 124000,
      },
    ];

    // Mevcut reels sayısını atla
    const toCreate = reelsToAdd.slice(reelCount);
    if (toCreate.length > 0) {
      await prisma.reel.createMany({ data: toCreate });
      console.log(`${toCreate.length} yeni Reel eklendi`);
    }
  }

  // ─── Market ilanları (en az 20) ───
  const listingCount = await prisma.listing.count();
  if (listingCount < 20) {
    const listings = [
      { sellerId: artist.id,   title: "Dijital Sanat Paketi",               description: "10 adet özel dijital sanat eseri, yüksek çözünürlük PNG + SVG", pricePart: "250",  imageUrl: "https://picsum.photos/seed/lst1/400/300" },
      { sellerId: creator.id,  title: "Premium Reels Şablonu Seti",         description: "20 profesyonel Reels şablonu, After Effects + CapCut formatı", pricePart: "120",  imageUrl: "https://picsum.photos/seed/lst2/400/300" },
      { sellerId: artist.id,   title: "NFT Avatar Koleksiyonu",             description: "100 adet benzersiz pixel art avatar, mint'e hazır", pricePart: "500",  imageUrl: "https://picsum.photos/seed/lst3/400/300" },
      { sellerId: saphara.id,  title: "Kripto Analiz Rehberi 2025",         description: "BTC, ETH, BNB ve PART için teknik analiz PDF rehberi", pricePart: "80",   imageUrl: "https://picsum.photos/seed/lst4/400/300" },
      { sellerId: creator.id,  title: "BNB Chain Başlangıç Paketi",         description: "MetaMask kurulumundan DeFi'ye eksiksiz başlangıç rehberi", pricePart: "60",   imageUrl: "https://picsum.photos/seed/lst5/400/300" },
      { sellerId: artist.id,   title: "PART Coin Yatırım Stratejisi",       description: "PART tokenin tokenomics analizi ve uzun vadeli yatırım stratejisi", pricePart: "150",  imageUrl: "https://picsum.photos/seed/lst6/400/300" },
      { sellerId: creator.id,  title: "Sosyal Medya Büyüme Kiti",           description: "Takipçi büyümesi için 30 günlük içerik planı + şablonlar", pricePart: "90",   imageUrl: "https://picsum.photos/seed/lst7/400/300" },
      { sellerId: artist.id,   title: "Video Düzenleme Preset Koleksiyonu", description: "50 adet sinematik LUT ve renk presetleri, DaVinci + Premiere", pricePart: "180",  imageUrl: "https://picsum.photos/seed/lst8/400/300" },
      { sellerId: saphara.id,  title: "Logo ve Grafik Tasarım Paketi",      description: "Kripto projeler için 5 adet özel logo + marka kimliği", pricePart: "400",  imageUrl: "https://picsum.photos/seed/lst9/400/300" },
      { sellerId: creator.id,  title: "Web3 Öğretici Seti",                 description: "Solidity, BNB Chain, DeFi — 10 bölümlük kapsamlı video kursu", pricePart: "300",  imageUrl: "https://picsum.photos/seed/lst10/400/300" },
      { sellerId: artist.id,   title: "DeFi Masterclass Notları",           description: "Yield farming, liquidity mining ve staking stratejileri", pricePart: "200",  imageUrl: "https://picsum.photos/seed/lst11/400/300" },
      { sellerId: saphara.id,  title: "Kripto Trading Bot Konfigürasyonu",  description: "BNB Chain için optimize edilmiş bot ayarları ve stratejileri", pricePart: "350",  imageUrl: "https://picsum.photos/seed/lst12/400/300" },
      { sellerId: creator.id,  title: "NFT Mint Başlangıç Rehberi",         description: "OpenSea ve BNB Chain üzerinde NFT nasıl mint edilir, adım adım", pricePart: "70",   imageUrl: "https://picsum.photos/seed/lst13/400/300" },
      { sellerId: artist.id,   title: "Saphara İçerik Stratejisi Paketi",   description: "Saphara'da viral olan içerik formatları ve zamanlama rehberi", pricePart: "110",  imageUrl: "https://picsum.photos/seed/lst14/400/300" },
      { sellerId: saphara.id,  title: "Influencer Marketing Kiti",          description: "Marka iş birlikleri için pitch template ve fiyatlandırma rehberi", pricePart: "220",  imageUrl: "https://picsum.photos/seed/lst15/400/300" },
      { sellerId: creator.id,  title: "AI ile Kripto Sanatı Rehberi",       description: "Midjourney ve DALL-E ile NFT kaliteli kripto sanatı oluşturma", pricePart: "130",  imageUrl: "https://picsum.photos/seed/lst16/400/300" },
      { sellerId: artist.id,   title: "Blockchain Geliştirici Başlangıç",   description: "Sıfırdan smart contract yazmak için BNB Chain geliştirici seti", pricePart: "280",  imageUrl: "https://picsum.photos/seed/lst17/400/300" },
      { sellerId: saphara.id,  title: "Kripto Haber Analiz Aboneliği",      description: "Haftalık BNB ekosistemi haber özeti ve piyasa analizi paketi", pricePart: "50",   imageUrl: "https://picsum.photos/seed/lst18/400/300" },
      { sellerId: creator.id,  title: "Sosyal Medya Banner Paketi",         description: "Kripto projeler için 10 adet sosyal medya banner tasarımı", pricePart: "160",  imageUrl: "https://picsum.photos/seed/lst19/400/300" },
      { sellerId: artist.id,   title: "Metaverse Mülkiyet Yatırım Rehberi", description: "Decentraland ve The Sandbox'ta sanal arsa yatırım stratejisi", pricePart: "240",  imageUrl: "https://picsum.photos/seed/lst20/400/300" },
    ];

    const toCreate = listings.slice(listingCount);
    if (toCreate.length > 0) {
      await prisma.listing.createMany({
        data: toCreate.map((l) => ({ ...l, status: "Listed" as const })),
      });
      console.log(`${toCreate.length} yeni ilan eklendi`);
    }
  }

  // ─── Sanal Magaza (30 urun) ───
  const storeItems = await prisma.storeItem.findMany({ select: { id: true }, take: 1 });
  if (storeItems.length === 0) {
    await prisma.storeItem.createMany({
      data: [
        // ─── AVATAR ───
        { kind: "avatar", name: "Altın Avatar",      imageUrl: "avatar-gold",     pricePart: "500",  priceUsd: "5",  active: true },
        { kind: "avatar", name: "Neon Avatar",       imageUrl: "avatar-neon",     pricePart: "500",  priceUsd: "5",  active: true },
        { kind: "avatar", name: "Kristal Avatar",    imageUrl: "avatar-crystal",  pricePart: "1000", priceUsd: "10", active: true },
        { kind: "avatar", name: "Ateş Avatar",       imageUrl: "avatar-fire",     pricePart: "1000", priceUsd: "10", active: true },
        { kind: "avatar", name: "Galaksi Avatar",    imageUrl: "avatar-galaxy",   pricePart: "1500", priceUsd: "15", active: true },
        { kind: "avatar", name: "Hologram Avatar",   imageUrl: "avatar-hologram", pricePart: "2000", priceUsd: "20", active: true },
        { kind: "avatar", name: "Efsane Avatar",     imageUrl: "avatar-legend",   pricePart: "5000", priceUsd: "50", active: true },
        // ─── ÇERÇEVE ───
        { kind: "frame", name: "Altın Çerçeve",      imageUrl: "frame-gold",      pricePart: "500",  priceUsd: "5",  active: true },
        { kind: "frame", name: "Elmas Çerçeve",      imageUrl: "frame-diamond",   pricePart: "1000", priceUsd: "10", active: true },
        { kind: "frame", name: "Mor Çerçeve",        imageUrl: "frame-purple",    pricePart: "500",  priceUsd: "5",  active: true },
        { kind: "frame", name: "Neon Çerçeve",       imageUrl: "frame-neon",      pricePart: "750",  priceUsd: "7",  active: true },
        { kind: "frame", name: "Ateş Çerçeve",       imageUrl: "frame-fire",      pricePart: "1500", priceUsd: "15", active: true },
        { kind: "frame", name: "Galaksi Çerçeve",    imageUrl: "frame-galaxy",    pricePart: "2000", priceUsd: "20", active: true },
        { kind: "frame", name: "Gökkuşağı Çerçeve",  imageUrl: "frame-rainbow",   pricePart: "3000", priceUsd: "30", active: true },
        // ─── ROZET ───
        { kind: "badge", name: "Erken Üye",          imageUrl: "badge-early",     pricePart: "300",  priceUsd: "3",  active: true },
        { kind: "badge", name: "Doğrulanmış Üretici",imageUrl: "badge-creator",   pricePart: "1000", priceUsd: "10", active: true },
        { kind: "badge", name: "PART Yatırımcısı",   imageUrl: "badge-investor",  pricePart: "2000", priceUsd: "20", active: true },
        { kind: "badge", name: "Top Fenomen",        imageUrl: "badge-influencer",pricePart: "3000", priceUsd: "30", active: true },
        { kind: "badge", name: "Crypto Guru",        imageUrl: "badge-crypto",    pricePart: "1500", priceUsd: "15", active: true },
        { kind: "badge", name: "BNB Chain OG",       imageUrl: "badge-bnb-og",    pricePart: "5000", priceUsd: "50", active: true },
        { kind: "badge", name: "Sanat Koleksiyoncusu",imageUrl: "badge-art",      pricePart: "1000", priceUsd: "10", active: true },
        { kind: "badge", name: "Reels Ustası",        imageUrl: "badge-reels",    pricePart: "750",  priceUsd: "7",  active: true },
        // ─── TEMA ───
        { kind: "theme", name: "Mor Gece",           imageUrl: "theme-purple-night", pricePart: "500",  priceUsd: "5",  active: true },
        { kind: "theme", name: "Okyanus Mavisi",     imageUrl: "theme-ocean",        pricePart: "500",  priceUsd: "5",  active: true },
        { kind: "theme", name: "Kızıl Gün Batımı",  imageUrl: "theme-sunset",       pricePart: "500",  priceUsd: "5",  active: true },
        { kind: "theme", name: "Orman Yeşili",       imageUrl: "theme-forest",       pricePart: "500",  priceUsd: "5",  active: true },
        { kind: "theme", name: "Neon Siber",         imageUrl: "theme-cyberpunk",    pricePart: "1000", priceUsd: "10", active: true },
        { kind: "theme", name: "Galaksi Karanlığı",  imageUrl: "theme-galaxy-dark",  pricePart: "1500", priceUsd: "15", active: true },
        { kind: "theme", name: "Altın PART",         imageUrl: "theme-part-gold",    pricePart: "2000", priceUsd: "20", active: true },
        { kind: "theme", name: "Beyaz Işık",         imageUrl: "theme-white-light",  pricePart: "300",  priceUsd: "3",  active: true },
      ],
    });
    console.log("Magaza: 30 urun eklendi");
  }

  console.log("Seed tamam:", { saphara: saphara.handle, creator: creator.handle, artist: artist.handle });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
