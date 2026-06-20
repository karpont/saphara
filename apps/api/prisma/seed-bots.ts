/**
 * 100 fake bot hesabı + başlangıç içerikleri.
 * `pnpm seed:bots` ile çalıştırılır.
 * Avatarlar: i.pravatar.cc (ücretsiz, key gerektirmez)
 * Görseller: picsum.photos (ücretsiz, key gerektirmez)
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* ── Bot profil havuzu ── */
const BOT_PROFILES = [
  // Kripto / DeFi odaklı
  { handle: "cryptoturk_ali",    name: "Ali Yılmaz",       bio: "BNB Chain developer. DeFi enthusiast. PART coin holder 🚀", cat: "crypto" },
  { handle: "defi_deniz",        name: "Deniz Kaya",        bio: "DeFi protocols araştırıyorum. Likidite madenciliği uzmanı.", cat: "crypto" },
  { handle: "bnb_beril",         name: "Beril Şahin",      bio: "BSC ekosistemi takipçisi. Web3 girişimcisi.", cat: "crypto" },
  { handle: "web3_mehmet",       name: "Mehmet Demir",      bio: "Web3 geliştirici | Smart contract güvenliği", cat: "crypto" },
  { handle: "hodl_hasan",        name: "Hasan Çelik",       bio: "Long-term PART holder. Kripto piyasası analistiyim.", cat: "crypto" },
  { handle: "partcoin_fan",      name: "Fatma Arslan",      bio: "PART coin topluluğu moderatörü 💎", cat: "crypto" },
  { handle: "blockchain_burak",  name: "Burak Öztürk",     bio: "Blockchain mühendisi | BNB Chain ekosistemi", cat: "crypto" },
  { handle: "nft_nazli",         name: "Nazlı Yıldız",     bio: "NFT koleksiyoncusu & dijital sanat meraklısı", cat: "crypto" },
  { handle: "tokenomics_tarik",  name: "Tarık Güler",       bio: "Tokenomics analizi yapıyorum. PART projesi danışmanı.", cat: "crypto" },
  { handle: "defi_dilan",        name: "Dilan Aydın",       bio: "Yield farming & staking stratejileri | BSC", cat: "crypto" },
  { handle: "crypto_ceren",      name: "Ceren Koç",         bio: "Kripto analist. Teknik analiz & grafik okuma.", cat: "crypto" },
  { handle: "satoshi_selin",     name: "Selin Doğan",       bio: "Bitcoin maxi değilim ama BNB Chain'e inandım 💪", cat: "crypto" },
  { handle: "altcoin_ahmet",     name: "Ahmet Polat",       bio: "Altcoin sezonu bekliyorum. PART top 100'e girer!", cat: "crypto" },
  { handle: "moon_murat",        name: "Murat Erdoğan",    bio: "Kripto trader. Günlük analizler paylaşıyorum.", cat: "crypto" },
  { handle: "bull_buse",         name: "Buse Çetin",        bio: "Boğa piyasası stratejisti | DeFi & GameFi", cat: "crypto" },
  // Teknoloji odaklı
  { handle: "tech_tevfik",       name: "Tevfik Sarı",       bio: "Full-stack geliştirici. Saphara ilk kullanıcılarından.", cat: "tech" },
  { handle: "code_cemre",        name: "Cemre Aktaş",       bio: "React & Node.js dev. Web3 projeleri üretiyorum.", cat: "tech" },
  { handle: "startup_selim",     name: "Selim Kılıç",       bio: "Teknoloji startup'ları takip ediyorum. Angel investor.", cat: "tech" },
  { handle: "ai_ayse",           name: "Ayşe Demirci",     bio: "AI & blockchain kesişimini araştırıyorum.", cat: "tech" },
  { handle: "ux_umut",           name: "Umut Şimşek",      bio: "UI/UX tasarımcı. Saphara'nın en sadık kullanıcısı 😄", cat: "tech" },
  { handle: "devops_doruk",      name: "Doruk Akın",        bio: "DevOps mühendisi. Cloud & blockchain altyapıları.", cat: "tech" },
  { handle: "mobile_merve",      name: "Merve Keskin",      bio: "Mobile developer. PWA & Web3 uygulamaları.", cat: "tech" },
  { handle: "security_sinan",    name: "Sinan Yüksel",      bio: "Siber güvenlik uzmanı. Blockchain audit yapıyorum.", cat: "tech" },
  // Sanat / Yaratıcı
  { handle: "art_aylin",         name: "Aylin Özgür",       bio: "Dijital sanatçı. NFT koleksiyonlarım PART ile satılıyor 🎨", cat: "art" },
  { handle: "design_defne",      name: "Defne Yaman",       bio: "Graphic designer. Web3 marka kimliği oluşturuyorum.", cat: "art" },
  { handle: "music_mete",        name: "Mete Balık",        bio: "Müzisyen & prodüktör. Müzik NFT'leri yaratıyorum 🎵", cat: "art" },
  { handle: "video_veli",        name: "Veli Güneş",        bio: "Video içerik üreticisi. Saphara Studio ile düzenliyorum.", cat: "art" },
  { handle: "photo_pinar",       name: "Pınar Arslan",      bio: "Fotoğrafçı. Dijital fotoğraflar PART kazandırıyor.", cat: "art" },
  { handle: "3d_baran",          name: "Baran Koçak",       bio: "3D sanatçı. Metaverse için varlıklar üretiyorum.", cat: "art" },
  { handle: "creative_cihat",    name: "Cihat Erdem",       bio: "Yaratıcı yönetmen. Markaları Web3'e taşıyorum.", cat: "art" },
  // Finans / Yatırım
  { handle: "finance_ferhat",    name: "Ferhat Gündüz",     bio: "Finansal analist. Kripto portföy yönetimi.", cat: "finance" },
  { handle: "invest_irmak",      name: "Irmak Şahin",       bio: "Yatırım danışmanı. PART uzun vadeli yatırım aracı.", cat: "finance" },
  { handle: "portfolio_pelin",   name: "Pelin Aslan",       bio: "Portföy çeşitlendirme uzmanı. DeFi geliri.", cat: "finance" },
  { handle: "trading_tolga",     name: "Tolga Yılmaz",      bio: "Kripto trader. Günlük PnL paylaşıyorum 📈", cat: "finance" },
  { handle: "wealth_wanda",      name: "Wanda Çakır",       bio: "Servet yönetimi & kripto. PART stake stratejileri.", cat: "finance" },
  // Sosyal / Influencer
  { handle: "lifestyle_lara",    name: "Lara Demir",        bio: "Yaşam tarzı içerikleri. Kripto ile özgür hayat 🌟", cat: "social" },
  { handle: "travel_taner",      name: "Taner Aksoy",       bio: "Seyahat bloggeri. Kripto ile dünyayı geziyorum ✈️", cat: "social" },
  { handle: "food_firat",        name: "Fırat Koç",         bio: "Yemek içerikleri + kripto hobileri 🍔", cat: "social" },
  { handle: "fitness_funda",     name: "Funda Özkan",       bio: "Fitness coach. Sağlıklı yaşam & Web3 özgürlüğü.", cat: "social" },
  { handle: "gaming_gorkem",     name: "Görkем Yıldız",    bio: "Oyuncu. GameFi & play-to-earn stratejistiyim.", cat: "social" },
  { handle: "fashion_fulya",     name: "Fulya Çelik",       bio: "Moda içerikleri. Dijital giyim & NFT wearables.", cat: "social" },
  // Uluslararası
  { handle: "crypto_kai",        name: "Kai Chen",          bio: "BNB Chain believer. Building on BSC ecosystem.", cat: "crypto" },
  { handle: "defi_alex",         name: "Alex Müller",       bio: "DeFi researcher from Berlin. PART holder 💎", cat: "crypto" },
  { handle: "nft_sofia",         name: "Sofia Martinez",    bio: "NFT artist. Selling digital art for PART tokens.", cat: "art" },
  { handle: "web3_james",        name: "James Park",        bio: "Web3 developer. Smart contracts on BNB Chain.", cat: "tech" },
  { handle: "hodl_ivan",         name: "Ivan Petrov",       bio: "Long term crypto investor. Diamond hands 💎", cat: "crypto" },
  { handle: "trade_yuki",        name: "Yuki Tanaka",       bio: "Crypto trader Tokyo. Technical analysis daily.", cat: "finance" },
  { handle: "art_emma",          name: "Emma Wilson",       bio: "Digital artist. Creating NFTs on Saphara Market.", cat: "art" },
  { handle: "blockchain_raj",    name: "Raj Patel",         bio: "Blockchain dev from Mumbai. BSC ecosystem builder.", cat: "tech" },
  { handle: "defi_lucas",        name: "Lucas Dupont",      bio: "DeFi yield farmer. Saphara early adopter.", cat: "crypto" },
  { handle: "crypto_ana",        name: "Ana Costa",         bio: "Crypto educator. Teaching DeFi to beginners.", cat: "crypto" },
  // Daha fazla Türk hesap
  { handle: "saphara_kemal",     name: "Kemal Yıldırım",   bio: "Saphara Türkiye topluluğu. BNB Chain evangelisti.", cat: "crypto" },
  { handle: "part_patriot",      name: "Oya Doğan",         bio: "PART tokenin ilk destekçilerinden. Topluluk büyüyor!", cat: "crypto" },
  { handle: "bnbchain_berkay",   name: "Berkay Akyüz",     bio: "BNB Chain validator. Saphara altyapı katkıcısı.", cat: "tech" },
  { handle: "crypto_kartal",     name: "Kartal Güven",      bio: "Kripto ağabey. Yeni başlayanlara rehberlik.", cat: "crypto" },
  { handle: "web3_zeynep",       name: "Zeynep Bulut",      bio: "Web3 girişimcisi. DAO yönetimi & governance.", cat: "tech" },
  { handle: "nft_nevzat",        name: "Nevzat Erdal",      bio: "NFT koleksiyoncusu. 100+ dijital sanat eserim var.", cat: "art" },
  { handle: "defi_didem",        name: "Didem Yıldız",     bio: "DeFi protokol analistiyim. Rug pull dedektifi 🔍", cat: "crypto" },
  { handle: "metaverse_mevlut",  name: "Mevlüt Kaya",      bio: "Metaverse araştırmacısı. Sanal dünya inşaatçısı.", cat: "tech" },
  { handle: "staking_serkan",    name: "Serkan Güler",      bio: "Staking getirilerini optimize ediyorum. Pasif gelir.", cat: "finance" },
  { handle: "dao_dilara",        name: "Dilara Öz",         bio: "DAO yönetişim uzmanı. Ademi merkeziyetçilik savunucusu.", cat: "crypto" },
  { handle: "layer2_levent",     name: "Levent Şen",        bio: "Layer 2 çözümleri araştırmacısı. BNB Chain optimizasyonu.", cat: "tech" },
  { handle: "tokenize_turhan",   name: "Turhan Baş",        bio: "Gerçek dünya varlıklarını tokenize ediyorum.", cat: "finance" },
  { handle: "smartcontract_sude",name: "Sude Yılmaz",       bio: "Smart contract geliştirici. Güvenli kod yazıyorum.", cat: "tech" },
  { handle: "yield_yasemin",     name: "Yasemin Duman",     bio: "Yield farming stratejistiyim. Getiri optimizasyonu.", cat: "finance" },
  { handle: "airdrop_adem",      name: "Adem Çiftçi",       bio: "Airdrop avcısı 🎯 PART early supporter.", cat: "crypto" },
  { handle: "whitelist_wahid",   name: "Wahid Önal",        bio: "IDO & whitelist uzmanı. Yeni projeler takipte.", cat: "crypto" },
  { handle: "gas_gulten",        name: "Gülten Arslan",     bio: "Gas optimizasyonu uzmanı. BSC transaction maliyeti.", cat: "tech" },
  { handle: "liquidity_lokman",  name: "Lokman Yıldırım",  bio: "Likidite sağlayıcı. PancakeSwap LP stratejileri.", cat: "finance" },
  { handle: "bridge_burcu",      name: "Burcu Şimşek",     bio: "Cross-chain köprüler & BSC ekosistemi.", cat: "crypto" },
  { handle: "governance_gulcan", name: "Gülcan Tepe",       bio: "DeFi yönetişim oylamaları takipçisi.", cat: "crypto" },
  { handle: "reels_reyhan",      name: "Reyhan Koç",        bio: "Saphara Reels içerik üreticisi. Video editör 🎬", cat: "art" },
  { handle: "studio_suzan",      name: "Suzan Yıldız",     bio: "Studio araçlarıyla içerik üretiyorum. Saphara Fan.", cat: "art" },
  { handle: "tips_tevita",       name: "Tevita Kemal",      bio: "İçerik üretiyorum, PART bahşiş alıyorum 🙏", cat: "social" },
  { handle: "market_mustafa",    name: "Mustafa Özdemir",  bio: "Saphara Market aktif satıcısı. Dijital ürünler.", cat: "social" },
  { handle: "part_permian",      name: "Permian Aksoy",     bio: "PART token ilk saatlerinden. Vizyon sahibi.", cat: "crypto" },
  { handle: "whale_walid",       name: "Walid Çelik",       bio: "Sessiz sedasız biriktiriyorum. 🐋 PART whale.", cat: "crypto" },
  { handle: "analyzer_alpay",    name: "Alpay Güneş",       bio: "On-chain analiz yapıyorum. Zincir verilerini okuyorum.", cat: "crypto" },
  { handle: "community_cahide",  name: "Cahide Erten",      bio: "Saphara Türkiye topluluk yöneticisi 🇹🇷", cat: "social" },
  { handle: "daily_davut",       name: "Davut Peker",       bio: "Her gün kripto haber paylaşıyorum. Günlük özet.", cat: "crypto" },
  { handle: "research_rifat",    name: "Rifat Baş",         bio: "Kripto araştırmacısı. Proje incelemeleri.", cat: "crypto" },
  { handle: "price_action_pasha",name: "Pasha Yılmaz",      bio: "Fiyat hareketi analizi. PART teknik analiz.", cat: "finance" },
  { handle: "early_adopter_ece", name: "Ece Doğan",         bio: "Saphara beta kullanıcısı. İlk günden beri buradayım!", cat: "social" },
  { handle: "education_emir",    name: "Emir Şahin",        bio: "Kripto eğitimi veriyorum. Yeni başlayanlar için.", cat: "social" },
  { handle: "ecosystem_elif",    name: "Elif Kara",         bio: "BSC ekosistem gelişimini takip ediyorum.", cat: "crypto" },
  { handle: "adoption_adnan",    name: "Adnan Güler",       bio: "Kripto adaptasyonu savunucusu. Herkes kullanmalı!", cat: "social" },
  { handle: "bullrun_bektas",    name: "Bektaş Yılmaz",    bio: "Boğa koşusu hazırlıkları devam ediyor. 🚀", cat: "crypto" },
  { handle: "patience_pınar",    name: "Pınar Kaya",        bio: "Sabırlı yatırımcı. PART uzun vadeli strateji.", cat: "finance" },
  { handle: "validator_vural",   name: "Vural Çetin",       bio: "BNB Chain validator operatörü. Ağ güvenliği.", cat: "tech" },
  { handle: "cross_chain_cem",   name: "Cem Arslan",        bio: "Cross-chain DeFi. Çoklu ağ stratejistiyim.", cat: "crypto" },
  { handle: "launch_lemi",       name: "Lemi Kırmızı",      bio: "IDO launchpad analistiyim. Yeni token fırsatları.", cat: "crypto" },
  { handle: "saphara_superfan",  name: "Güneş Öztürk",     bio: "Saphara'nın en büyük hayranı 🌟 Her özellik test ederim.", cat: "social" },
  { handle: "passive_income_po", name: "Polatcan Ateş",     bio: "Pasif gelir stratejileri. PART ile kripto geliri.", cat: "finance" },
  { handle: "dex_dogan",         name: "Doğan Canpolat",   bio: "DEX trader. PancakeSwap, BiSwap, ApeSwap uzmanı.", cat: "crypto" },
  { handle: "chart_cankut",      name: "Cankut Arslan",     bio: "Teknik analiz & grafik okuma. PART momentum.", cat: "finance" },
  { handle: "seed_sadik",        name: "Sadık Yaman",       bio: "Seed round yatırımcısı. Erken projeleri destekliyorum.", cat: "finance" },
];

/* ── Post içerik havuzu ── */
const POST_TEMPLATES = {
  crypto: [
    "PART token bu ay yüzde {N} büyüdü! BNB Chain'deki en hızlı büyüyen sosyal token. #PART #BNBChain",
    "DeFi protokollerinde likidite artıyor. PART/BNB çifti en yüksek hacme ulaştı 📈 #DeFi #PART",
    "Saphara'da içerik üretip PART kazanmak gerçekten mümkün. Bu ay {N} PART kazandım 💰 #SapharaKazan",
    "BSC ekosistemi hızla büyüyor. PART tokeni erken dönemde almak doğru karardı 🚀 #BSC #PART",
    "Web3 sosyal medya devriminin tam ortasındayız. Saphara bunu yapıyor! #Web3 #Saphara",
    "On-chain analiz: PART token büyük cüzdanlar biriktirmeye devam ediyor 🐋 #PARTWhale",
    "BNB Chain üzerinde en aktif token hareketleri PART'ta görülüyor. #BNBChain #PART",
    "Kripto piyasası volatil ama PART uzun vadede güçlü fundamentaller gösteriyor. #Kripto #PART",
    "Saphara Market'te dijital ürün sattım, PART aldım, cüzdana transferi 3 saniyede tamamlandı ⚡ #Saphara",
    "Sosyal medyada PART kazanmak: İçerik üret → Takipçi kazan → Bahşiş al 🎯 #PARTKazan",
    "BNB Chain gas ücretleri çok düşük. PART transferleri neredeyse ücretsiz! #GasOptimization",
    "PART tokenomics incelendi: %40 topluluk, %20 ekip, %15 likidite. Sağlam yapı 💎 #Tokenomics",
  ],
  tech: [
    "Saphara Studio ile videoyu tarayıcıda düzenledim! FFmpeg WASM harika bir teknoloji 🎬 #Studio #WebAssembly",
    "Web3 uygulamalarında UX sorunları en büyük engel. Saphara bunu çözüyor. #UX #Web3",
    "Smart contract güvenliği çok önemli. Saphara'nın tipping contract'ı reentrancy'e karşı korumalı 🔒",
    "PWA teknolojisi ile Saphara telefona kurulabilir. Native app gibi çalışıyor! #PWA",
    "SIWE (Sign-In With Ethereum) ile cüzdanla giriş. Şifre yok, 2FA yok, sadece imza ✍️ #SIWE",
    "BNB Chain EVM uyumlu. Solidity ile yazılmış kontratlar aynen çalışıyor 💡 #Solidity",
    "Saphara altyapısı: Fastify + PostgreSQL + Next.js. Güçlü ve ölçeklenebilir ✅",
    "WebSocket ile gerçek zamanlı chat. Mesajlar 50ms'de iletiliyor ⚡ #Realtime",
  ],
  art: [
    "Yeni dijital sanat eserim Saphara Market'te! PART ile sahip olabilirsiniz 🎨 #DigitalArt #PART",
    "Saphara Reels'e {N} saniyede müzikli kısa video yükledim. Stüdyo araçları süper! 🎬 #Reels",
    "NFT'ler ölmedi, sadece evrildi. Saphara Market dijital içerik ekonomisi yaratıyor 💫",
    "Sanatçılar için Web3: Doğrudan satış, aracısız gelir, PART kazanç. Saphara ideal platform 🎨",
    "Video düzenleme artık masaüstü uygulama gerektirmiyor. Saphara Studio tarayıcıda 🖥️",
    "Müzik üretiyorum, Saphara'da paylaşıyorum, dinleyenler PART ile destekliyor 🎵 #MuzikNFT",
  ],
  finance: [
    "PART/USDT paritesi analiz: Destek {N} USDT, direnç {M} USDT. Teknik görünüm pozitif 📊",
    "DeFi getiri hesabı: Saphara'da içerik üretmek geleneksel finansa göre daha karlı 💹",
    "Kripto portföy çeşitlendirmesi: BTC+ETH+BNB+PART güçlü bir BSC odaklı portföy oluşturur",
    "Pasif gelir stratejisi: Saphara'da içerik üret → PART bahşiş al → PancakeSwap'ta stake 📈",
    "PART piyasa değeri henüz küçük ama topluluk büyüyor. Erken dönem fırsatı 🎯 #EarlyStage",
    "Kripto yatırımında en önemli şey: Proje kullanım durumu. Saphara gerçek kullanım sunuyor ✅",
  ],
  social: [
    "Saphara'da {N} takipçiye ulaştım! Teşekkürler topluluk 🙏 #SapharaTopluluk",
    "Web3 sosyal medya ile verilerimin kontrolü artık bende. Gizlilik önce gelir 🔐",
    "Kripto kullananlar buraya! Saphara'da cüzdan bağlayın, PART kazanın 💰",
    "Geleneksel sosyal medyaya veda. Saphara'da içerik üretmek hem eğlenceli hem kazançlı!",
    "BNB Chain topluluğu Saphara'da bir araya geliyor 🌐 #BNBTopluluk",
    "Kripto severler buluşma noktası: Saphara! Ücretsiz katılın, PART kazanın 🚀",
    "Her gün Saphara'da 1 içerik paylaşıyorum. Düzenli içerik = Düzenli PART geliri 📲",
  ],
};

/* ── Resim URL'leri (picsum.photos — ücretsiz, kişi fotoğrafı yok) ── */
function postImageUrl(seed: string | number, w = 800, h = 500): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

/* DiceBear: Üretilen avatarlar, gerçek kişi fotoğrafı yok, MIT lisanslı */
const DICEBEAR_STYLES: Record<string, string> = {
  crypto:  "avataaars",     // sevimli insan karakteri
  tech:    "micah",         // insan portresi
  art:     "lorelei",       // çizgi sanatçı karakteri
  finance: "notionists",    // profesyonel minimalist insan
  social:  "personas",      // düz illüstrasyon insan
};

function avatarUrl(handle: string, cat: string): string {
  const style = DICEBEAR_STYLES[cat] ?? "identicon";
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(handle)}&size=150`;
}

/* ── İçerik seçici ── */
function randomTemplate(cat: string): string {
  const arr = POST_TEMPLATES[cat as keyof typeof POST_TEMPLATES] ?? POST_TEMPLATES.crypto;
  const t = arr[Math.floor(Math.random() * arr.length)];
  return t
    .replace(/{N}/g, String(Math.floor(Math.random() * 900 + 100)))
    .replace(/{M}/g, String((Math.floor(Math.random() * 50) + 10) / 100));
}

async function main() {
  console.log("Bot seed başlıyor — 100 hesap oluşturuluyor...");

  // Ana saphara hesabı (zaten var, ID'yi al)
  const saphara = await prisma.user.findUnique({ where: { handle: "saphara" } });
  if (!saphara) throw new Error("Ana saphara hesabı bulunamadı — önce `pnpm prisma:seed` çalıştırın.");

  const bots: { id: string; cat: string }[] = [];

  for (let i = 0; i < BOT_PROFILES.length; i++) {
    const p = BOT_PROFILES[i];
    const user = await prisma.user.upsert({
      where: { handle: p.handle },
      update: { avatarUrl: avatarUrl(p.handle, p.cat), name: p.name, bio: p.bio },
      create: {
        handle: p.handle,
        name: p.name,
        bio: p.bio,
        avatarUrl: avatarUrl(p.handle, p.cat),
        walletAddress: `0x${(i + 1000).toString(16).padStart(40, "0")}`,
        earningsPart: String(Math.floor(Math.random() * 5000)),
      },
    });
    bots.push({ id: user.id, cat: p.cat });

    // Saphara'yı takip et
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: user.id, followingId: saphara.id } },
      update: {},
      create: { followerId: user.id, followingId: saphara.id },
    });
  }

  console.log(`${bots.length} bot hesabı oluşturuldu/güncellendi`);

  // Botlar birbirini takip etsin (her bot rastgele 5-15 başkasını takip eder)
  let followCount = 0;
  for (const bot of bots) {
    const targets = bots
      .filter((b) => b.id !== bot.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 10) + 5);
    for (const t of targets) {
      try {
        await prisma.follow.upsert({
          where: { followerId_followingId: { followerId: bot.id, followingId: t.id } },
          update: {},
          create: { followerId: bot.id, followingId: t.id },
        });
        followCount++;
      } catch { /* zaten takip ediyor */ }
    }
  }
  console.log(`${followCount} takip ilişkisi oluşturuldu`);

  // Her bot için 3-8 başlangıç gönderisi
  let postCount = 0;
  for (let i = 0; i < bots.length; i++) {
    const bot = bots[i];
    const numPosts = Math.floor(Math.random() * 6) + 3;
    for (let j = 0; j < numPosts; j++) {
      const text = randomTemplate(bot.cat);
      const existing = await prisma.post.findFirst({ where: { authorId: bot.id, text } });
      if (existing) continue;

      const useImage = Math.random() > 0.4; // %60 görsel
      const mediaUrl = useImage ? postImageUrl(i * 10 + j) : undefined;
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const createdAt = new Date(Date.now() - (daysAgo * 86400 + hoursAgo * 3600) * 1000);

      const post = await prisma.post.create({
        data: {
          authorId: bot.id,
          text,
          mediaUrl,
          mediaType: useImage ? "image" : undefined,
          likes: Math.floor(Math.random() * 2000),
          repostCount: Math.floor(Math.random() * 500),
          qualityScore: 0.5 + Math.random() * 0.4,
          createdAt,
        },
      });

      // Hashtag'leri kaydet
      const tags = [...new Set((text.match(/#[\wÀ-ɏğüşıöçĞÜŞİÖÇ]+/gu) ?? []).map((t: string) => t.slice(1).toLowerCase()))];
      for (const tag of tags) {
        const ht = await prisma.hashtag.upsert({
          where: { tag }, update: { postCount: { increment: 1 } }, create: { tag, postCount: 1 },
        });
        await prisma.postHashtag.upsert({
          where: { postId_hashtagId: { postId: post.id, hashtagId: ht.id } },
          update: {}, create: { postId: post.id, hashtagId: ht.id },
        });
      }
      postCount++;
    }
  }

  console.log(`${postCount} bot gönderisi oluşturuldu`);
  console.log("Bot seed tamamlandı ✓");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
