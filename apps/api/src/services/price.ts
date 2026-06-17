import { prisma } from "../db/client";

/**
 * PART/USD fiyat yonetimi.
 * - Taban (minimum): 0.01 USD. Bunun altina inemez.
 * - Ust sinir yok: piyasaya gore yukari serbestce ayarlanabilir.
 * - Deger DB'de PlatformSetting olarak tutulur (owner panelinden degisir).
 * - Frontend bu degeri /price uzerinden okur; magaza fiyatlari buna gore gosterilir.
 */

const KEY = "part_usd_rate";
export const PART_USD_FLOOR = 0.01;   // taban deger
const DEFAULT_RATE = 0.01;

/** Guncel PART/USD oranini doner. */
export async function getPartUsdRate(): Promise<number> {
  try {
    const row = await prisma.platformSetting.findUnique({ where: { key: KEY } });
    const v = row ? Number(row.value) : DEFAULT_RATE;
    return Number.isFinite(v) && v >= PART_USD_FLOOR ? v : DEFAULT_RATE;
  } catch {
    return DEFAULT_RATE;
  }
}

/** Owner tarafindan fiyat gunceller. Tabanin altina inemez. */
export async function setPartUsdRate(rate: number): Promise<{ rate: number }> {
  if (!Number.isFinite(rate) || rate < PART_USD_FLOOR) {
    throw new Error(`Fiyat tabani ${PART_USD_FLOOR} altinda olamaz`);
  }
  await prisma.platformSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: String(rate) },
    update: { value: String(rate) },
  });
  return { rate };
}

/** USD bedelini guncel orana gore PART miktarina cevirir. */
export async function usdToPart(usd: number): Promise<number> {
  const rate = await getPartUsdRate();
  return Math.ceil(usd / rate);
}
