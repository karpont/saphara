import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const QUESTS = [
  // Onboarding
  { kind: "onboarding", title: "Profilini Tamamla", description: "Bio ve profil fotoğrafı ekle", icon: "👤", xpReward: 100, partReward: "10", target: 1, sortOrder: 1 },
  { kind: "onboarding", title: "İlk Gönderiyi Yap", description: "İlk paylaşımını oluştur", icon: "✏️", xpReward: 150, partReward: "15", target: 1, sortOrder: 2 },
  { kind: "onboarding", title: "İlk Takip", description: "Birini takip et", icon: "👥", xpReward: 50, partReward: "5", target: 1, sortOrder: 3 },
  { kind: "onboarding", title: "Cüzdanını Bağla", description: "BNB cüzdanını Saphara'ya bağla", icon: "👛", xpReward: 200, partReward: "25", target: 1, sortOrder: 4 },
  { kind: "onboarding", title: "İlk Beğeni", description: "Bir gönderiyi beğen", icon: "❤️", xpReward: 30, partReward: "0", target: 1, sortOrder: 5 },
  // Daily
  { kind: "daily", title: "Günlük Giriş", description: "Bugün Saphara'ya giriş yap", icon: "🌅", xpReward: 50, partReward: "2", target: 1, sortOrder: 10 },
  { kind: "daily", title: "3 Gönderi Beğen", description: "Bugün 3 gönderiyi beğen", icon: "👍", xpReward: 30, partReward: "0", target: 3, sortOrder: 11 },
  { kind: "daily", title: "1 Yorum Yap", description: "Herhangi bir gönderiye yorum yaz", icon: "💬", xpReward: 40, partReward: "1", target: 1, sortOrder: 12 },
  { kind: "daily", title: "1 Gönderi Paylaş", description: "Bugün bir gönderi oluştur", icon: "📝", xpReward: 80, partReward: "3", target: 1, sortOrder: 13 },
  // Weekly
  { kind: "weekly", title: "5 Takipçi Kazan", description: "Bu hafta 5 yeni takipçiye ulaş", icon: "🌟", xpReward: 200, partReward: "20", target: 5, sortOrder: 20 },
  { kind: "weekly", title: "10 Gönderi Paylaş", description: "Bu hafta 10 gönderi oluştur", icon: "📣", xpReward: 300, partReward: "30", target: 10, sortOrder: 21 },
  { kind: "weekly", title: "Topluluğa Katıl", description: "Bir topluluğa üye ol", icon: "🏘️", xpReward: 150, partReward: "15", target: 1, sortOrder: 22 },
  { kind: "weekly", title: "5 Bahşiş Gönder", description: "Bu hafta 5 farklı kullanıcıya bahşiş gönder", icon: "💸", xpReward: 250, partReward: "0", target: 5, sortOrder: 23 },
  // Achievements
  { kind: "achievement", title: "50 Takipçi", description: "Toplamda 50 takipçiye ulaş", icon: "🏆", xpReward: 500, partReward: "50", target: 50, sortOrder: 30 },
  { kind: "achievement", title: "100 Gönderi", description: "Toplamda 100 gönderi paylaş", icon: "💯", xpReward: 1000, partReward: "100", target: 100, sortOrder: 31 },
  { kind: "achievement", title: "7 Günlük Seri", description: "7 gün art arda giriş yap", icon: "🔥", xpReward: 700, partReward: "70", target: 7, sortOrder: 32 },
  { kind: "achievement", title: "İlk NFT", description: "Bir NFT satın al veya listele", icon: "🎨", xpReward: 400, partReward: "40", target: 1, sortOrder: 33 },
  { kind: "achievement", title: "PART Balina", description: "Toplamda 1000 PART kazan", icon: "🐋", xpReward: 2000, partReward: "200", target: 1000, sortOrder: 34 },
  { kind: "achievement", title: "10 Topluluk Üyesi", description: "10 üyeye sahip topluluk kur", icon: "👑", xpReward: 800, partReward: "80", target: 10, sortOrder: 35 },
];

async function main() {
  console.log("Quest seed başlıyor...");
  // Idempotent: skip if quests already exist
  const existing = await prisma.quest.count();
  if (existing >= QUESTS.length) {
    console.log(`Zaten ${existing} quest mevcut, atlanıyor.`);
    return;
  }
  await prisma.quest.deleteMany();
  const result = await prisma.quest.createMany({ data: QUESTS.map(q => ({ ...q, active: true })) });
  console.log(`✓ ${result.count} quest oluşturuldu`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
