/* PART Coin'i Launchpad'de tanıtım projesi olarak ekler. */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const saphara = await prisma.user.findUnique({ where: { handle: "saphara" } });
  if (!saphara) { console.log("saphara kullanıcısı bulunamadı, atlandı"); return; }

  const exists = await prisma.launchpadProject.findFirst({ where: { symbol: "PART" } });
  if (exists) { console.log("PART projesi zaten var"); return; }

  const now = new Date();
  const endAt = new Date(now.getTime() + 60 * 86400000);

  await prisma.launchpadProject.create({
    data: {
      creatorId: saphara.id,
      name: "PART Coin",
      symbol: "PART",
      tagline: "Saphara'nın resmi sosyal & DeFi tokenı — içerik üret, kazan, yönet.",
      description: "PART, Saphara platformunun yerel tokenıdır. İçerik üretimi, staking, reklam ödemeleri, NFT işlemleri ve DAO yönetişiminde kullanılır. BNB Chain üzerinde düşük işlem maliyetiyle çalışır. Erken katılımcılar launchpad fiyatından PART alarak platformun büyümesinden faydalanabilir.",
      logoUrl: "/part-coin.svg",
      bannerUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200",
      websiteUrl: "https://saphara.pearlbagltd.com",
      targetAmount: "5000000",
      raisedAmount: "1842000",
      tokenPrice: "0.01",
      totalSupply: "1000000000",
      minBuy: "1000",
      maxBuy: "10000",
      status: "active",
      startAt: now,
      endAt,
      chain: "BSC",
      participants: 1840,
      tgeUnlockPct: 25,
      cliffMonths: 1,
      linearMonths: 6,
    },
  });
  console.log("PART Coin launchpad projesi oluşturuldu ✓");
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
