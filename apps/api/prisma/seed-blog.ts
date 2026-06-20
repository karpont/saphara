/* Blog sayfasını gerçek, yayınlanmış yazılarla doldurur (önceden DB boştu). */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const POSTS = [
  {
    title: "PART Token ile Sosyal Medyada Para Kazanmak: Kapsamlı Rehber",
    slug: "part-token-sosyal-medya-kazanc",
    excerpt: "Web3 sosyal platformlarda içerik üreterek PART token kazanmanın en etkili yollarını keşfedin.",
    category: "crypto", tags: ["PART", "Web3", "CreatorEconomy", "Kazanç"], readingMins: 7,
    featured: true, hasPoll: true,
    pollQuestion: "İçerik üreticisi olarak en çok hangi kazanç yöntemini kullanıyorsun?",
    pollOptions: ["Tip alma", "Reklam payı", "Staking ödülü", "Referral"],
    coverUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
    authorHandle: "saphara",
    content: `Saphara'da içerik üreterek PART token kazanmanın dört ana yolu var: tip alma, reklam geliri payı, staking ödülleri ve referral programı.

**Tip Alma**
Takipçilerin beğendiği içeriklerinize doğrudan PART gönderebilir. Her tip işlemi anında cüzdanınıza yansır, platform küçük bir komisyon alır.

**Reklam Geliri**
İçerikleriniz reklam akışına dahil edildiğinde gösterim ve tıklama başına gelir kazanırsınız. Takipçi sayınız ve etkileşim oranınız arttıkça payınız büyür.

**Staking Ödülleri**
PART'ınızı kilitleyerek pasif gelir elde edebilirsiniz. Farklı kilitleme sürelerine göre değişen APY oranları sunulur.

**Referral Programı**
Platforma yeni kullanıcı davet ettiğinizde, davet sayınız arttıkça kademeli olarak artan PART ödülleri kazanırsınız.

En sürdürülebilir strateji bu dört yöntemi birlikte kullanmaktır: düzenli, kaliteli içerik üretip kazandığınız PART'ın bir kısmını stake ederek pasif gelir akışı oluşturabilirsiniz.`,
  },
  {
    title: "DeFi'de Güvenli Staking: Akıllı Sözleşme Riskleri ve Korunma Yolları",
    slug: "defi-staking-guvenlik",
    excerpt: "Likidite havuzlarında sermayenizi kaybetmeden kazanç elde etmek için bilmeniz gereken her şey.",
    category: "defi", tags: ["DeFi", "Staking", "Güvenlik", "BNBChain"], readingMins: 11,
    featured: true, hasPoll: false,
    coverUrl: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800",
    authorHandle: "saphara",
    content: `DeFi protokollerinde staking yaparken karşılaşabileceğiniz üç temel risk: akıllı sözleşme açıkları, impermanent loss ve rug pull.

**Akıllı Sözleşme Riski**
Bir protokole fon kilitlemeden önce kontratın bağımsız bir firma tarafından audit edilip edilmediğini kontrol edin. Audit raporu olmayan, anonim ekipli projelerden kaçının.

**Impermanent Loss**
LP (likidite sağlayıcı) havuzlarında iki farklı token'ın fiyat oranı değiştiğinde, havuzdan çektiğinizde başlangıçtaki değerden daha az alabilirsiniz. Tek taraflı staking bu riski taşımaz.

**Rug Pull Belirtileri**
Kilitlenmemiş likidite, anonim geliştirici ekibi, gerçekçi olmayan APY vaatleri (%1000+) kırmızı bayraktır.

**Korunma Stratejisi**
Sermayenizi birden fazla protokole dağıtın, sadece audit edilmiş ve uzun süredir faaliyette olan platformları tercih edin, ve asla kaybetmeyi kaldıramayacağınız miktarı yatırmayın.`,
  },
  {
    title: "NFT Koleksiyon Oluşturma: ERC-721 ve ERC-2981 Royalty Standardı",
    slug: "nft-koleksiyon-erc721-royalty",
    excerpt: "Sıfırdan bir NFT koleksiyonu nasıl oluşturulur? ERC-2981 royalty standardı ile her satıştan otomatik komisyon kazanın.",
    category: "nft", tags: ["NFT", "ERC721", "Royalty", "Creator"], readingMins: 9,
    featured: false, hasPoll: true,
    pollQuestion: "NFT koleksiyonunda ideal royalty oranı kaç olmalı?",
    pollOptions: ["%2.5", "%5", "%7.5", "%10+"],
    coverUrl: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800",
    authorHandle: "saphara",
    content: `NFT koleksiyonu oluşturmanın ilk adımı sanat eserlerinizi hazırlamak, ikincisi ise doğru standardı seçmektir.

**ERC-721 Standardı**
Her NFT benzersiz (non-fungible) bir token'dır. Koleksiyonunuzdaki her eserin kendine ait bir token ID'si ve metadata'sı (isim, açıklama, görsel URL, özellikler) bulunur.

**ERC-2981 Royalty Standardı**
Bu standart sayesinde koleksiyonunuz her ikinci el satışta otomatik olarak belirlediğiniz yüzdede komisyon alır — bu, pazaryerleri arasında evrensel olarak desteklenen bir mekanizmadır.

**Saphara'da Koleksiyon Açma**
Saphara NFT pazarında koleksiyon oluşturduğunuzda royalty oranınızı belirler, mint limitini ayarlar ve eserlerinizi PART veya USDT ile satışa sunabilirsiniz.`,
  },
  {
    title: "BNB Chain'de Gas Optimizasyonu: İşlem Maliyetlerini %60 Azaltın",
    slug: "bnbchain-gas-optimizasyon",
    excerpt: "Akıllı sözleşmelerde gas tüketimini minimize etmek için pratik Solidity teknikleri.",
    category: "technology", tags: ["BNBChain", "Solidity", "Gas", "Dev"], readingMins: 13,
    featured: false, hasPoll: false,
    coverUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
    authorHandle: "saphara",
    content: `BNB Chain üzerinde işlem maliyetlerini düşürmek için geliştiricilerin uygulayabileceği başlıca teknikler:

**Storage Optimizasyonu**
Storage okuma/yazma işlemleri en maliyetli operasyonlardır. Mümkün olduğunda değişkenleri \`memory\` veya \`calldata\`'da tutun, sadece gerektiğinde storage'a yazın.

**Packed Struct Kullanımı**
Birden fazla küçük değişkeni (uint8, bool, address) tek bir storage slot'una sığdırarak gas tasarrufu sağlayabilirsiniz.

**Batch İşlemler**
Çok sayıda küçük transaction yerine, mümkün olduğunda işlemleri tek bir fonksiyon çağrısında toplu yapın.

**Event Kullanımı**
Sorgulanması gereken ama kontrat mantığını etkilemeyen veriler için storage yerine event log kullanın — çok daha ucuzdur.

Bu tekniklerin doğru uygulanması, kullanıcı başına işlem maliyetini önemli ölçüde azaltabilir.`,
  },
  {
    title: "Kripto Piyasasında Teknik Analiz: Destek-Direnç ve Fibonacci",
    slug: "kripto-teknik-analiz-fibonacci",
    excerpt: "Bitcoin ve altcoinlerde destek/direnç seviyeleri nasıl belirlenir? Fibonacci retracement, RSI ve MACD kullanımı.",
    category: "analysis", tags: ["TeknikAnaliz", "Bitcoin", "Fibonacci", "Trading"], readingMins: 8,
    featured: true, hasPoll: false,
    coverUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
    authorHandle: "saphara",
    content: `Teknik analiz, geçmiş fiyat hareketlerini inceleyerek olası gelecek hareketleri tahmin etmeye çalışan bir yöntemdir.

**Destek ve Direnç**
Destek, fiyatın düşüşte zorlandığı seviye; direnç ise yükselişte zorlandığı seviyedir. Bu seviyeler genellikle geçmişte fiyatın tepki verdiği noktalardan belirlenir.

**Fibonacci Retracement**
Bir trendin başlangıç ve bitiş noktaları arasına çizilen Fibonacci seviyeleri (%23.6, %38.2, %61.8 gibi) olası geri çekilme/düzeltme noktalarını gösterir.

**RSI (Relative Strength Index)**
0-100 arası bir momentum göstergesidir. 70 üzeri "aşırı alım", 30 altı "aşırı satım" bölgesi olarak yorumlanır.

**MACD**
İki hareketli ortalama arasındaki ilişkiyi gösteren bir trend takip göstergesidir; kesişimler alım/satım sinyali olarak kullanılır.

Hiçbir gösterge tek başına kesin sonuç vermez — birden fazla göstergeyi birlikte değerlendirmek ve risk yönetimine her zaman öncelik vermek gerekir.`,
  },
  {
    title: "Saphara DAO: Topluluk Kararları ve Yönetişim Rehberi",
    slug: "saphara-dao-yonetisim",
    excerpt: "PART token sahipleri platform kararlarına nasıl katılır? Oylama mekanizması ve proposal oluşturma rehberi.",
    category: "community", tags: ["DAO", "Governance", "PART", "Topluluk"], readingMins: 6,
    featured: false, hasPoll: true,
    pollQuestion: "DAO'da en çok hangi konuda oy kullanmak istersin?",
    pollOptions: ["Platform ücretleri", "Yeni özellikler", "Hazine kullanımı", "Moderasyon kuralları"],
    coverUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
    authorHandle: "saphara",
    content: `Saphara DAO, platformun önemli kararlarının PART token sahipleri tarafından şeffaf şekilde alınmasını sağlayan yönetişim sistemidir.

**Proposal Oluşturma**
Belirli bir miktar PART'a sahip herkes yeni bir öneri (proposal) oluşturabilir. Öneriler platform ücretleri, yeni özellikler veya hazine kullanımı gibi konuları kapsayabilir.

**Oylama Süreci**
Her proposal belirli bir süre (genellikle 5-7 gün) oylamaya açık kalır. Oy gücü, kilitli (staked) PART miktarınızla orantılıdır.

**Quorum Gereksinimi**
Bir önerinin geçerli sayılması için minimum katılım eşiğine (quorum) ulaşması gerekir; aksi halde öneri reddedilmiş sayılır.

**Şeffaflık**
Tüm oylama geçmişi ve sonuçlar herkese açık olarak görüntülenebilir, hiçbir karar gizli alınmaz.`,
  },
  {
    title: "2025 Kripto Piyasası Görünümü: Yükseliş Trendi mi, Düzeltme mi?",
    slug: "2025-kripto-market-gorunumu",
    excerpt: "Piyasa dinamikleri, kurumsal yatırım akışı ve altcoin sezonu beklentileri üzerine genel bir bakış.",
    category: "market", tags: ["Market", "Bitcoin", "2025", "Analiz"], readingMins: 10,
    featured: true, hasPoll: true,
    pollQuestion: "2025 için piyasa beklentin nedir?",
    pollOptions: ["Güçlü yükseliş", "Yatay seyir", "Düzeltme bekliyorum", "Belirsiz"],
    coverUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800",
    authorHandle: "saphara",
    content: `Kripto piyasaları döngüsel yapısıyla bilinir; kurumsal benimseme, düzenleyici gelişmeler ve makroekonomik koşullar fiyat hareketlerini şekillendirir.

**Kurumsal Akış**
Kurumsal yatırımcıların piyasaya girişi, likiditeyi ve genel güveni artıran önemli bir faktördür.

**Altcoin Sezonu**
Bitcoin dominansının düştüğü dönemlerde, sermaye genellikle altcoinlere doğru kayar — bu döngü "altcoin sezonu" olarak adlandırılır.

**Risk Yönetimi**
Piyasa koşulları ne olursa olsun, portföy çeşitlendirmesi ve pozisyon büyüklüğü yönetimi her zaman önceliklendirilmelidir.

Bu içerik yatırım tavsiyesi değildir; kendi araştırmanızı yapın (DYOR).`,
  },
  {
    title: "Web3 Cüzdan Güvenliği: MetaMask ve Trust Wallet'ı Koruma Rehberi",
    slug: "web3-cuzdan-guvenligi",
    excerpt: "Seed phrase koruması, phishing saldırıları ve donanım cüzdanı kullanımı hakkında pratik öneriler.",
    category: "tutorial", tags: ["Güvenlik", "Cüzdan", "MetaMask", "Rehber"], readingMins: 8,
    featured: false, hasPoll: false,
    coverUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800",
    authorHandle: "saphara",
    content: `Web3 cüzdanınızın güvenliği, kripto varlıklarınızın güvenliğiyle doğrudan ilişkilidir. Temel kurallar:

**Seed Phrase Koruması**
12-24 kelimelik gizli anahtarınızı asla dijital ortamda (ekran görüntüsü, e-posta, bulut notu) saklamayın. Kağıda yazıp güvenli bir yerde fiziksel olarak muhafaza edin.

**Phishing Saldırıları**
Sahte siteler gerçek cüzdan arayüzlerini taklit ederek seed phrase'inizi çalmaya çalışır. Her zaman URL'yi kontrol edin, bağlantılara değil resmi kaynaklara güvenin.

**Donanım Cüzdanı**
Yüksek miktarda varlık tutuyorsanız, özel anahtarlarınızı internete bağlı bir cihazda tutmayan bir donanım cüzdanı (Ledger, Trezor) kullanmayı düşünün.

**İşlem Onayı**
İmzalamadan önce her işlemin detaylarını (alıcı adresi, miktar, kontrat) dikkatlice inceleyin — kör imza atmayın.`,
  },
];

async function main() {
  let created = 0;
  for (const p of POSTS) {
    const author = await prisma.user.findUnique({ where: { handle: p.authorHandle } });
    if (!author) { console.log(`Atlandi (yazar bulunamadi): ${p.authorHandle}`); continue; }

    const exists = await prisma.blogPost.findUnique({ where: { slug: p.slug } });
    if (exists) { console.log(`Zaten var: ${p.slug}`); continue; }

    await prisma.blogPost.create({
      data: {
        authorId: author.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        coverUrl: p.coverUrl,
        category: p.category,
        tags: p.tags,
        readingMins: p.readingMins,
        published: true,
        featured: p.featured,
        hasPoll: p.hasPoll,
        pollQuestion: p.pollQuestion ?? null,
        pollOptions: p.pollOptions ?? [],
        likes: Math.floor(Math.random() * 400) + 50,
        views: Math.floor(Math.random() * 8000) + 500,
      },
    });
    created++;
  }
  console.log(`Olusturulan blog yazisi: ${created} / ${POSTS.length}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
