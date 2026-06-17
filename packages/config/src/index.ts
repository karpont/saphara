/**
 * Saphara merkezi yapilandirmasi.
 */

const ZERO = "0x0000000000000000000000000000000000000000" as const;

const PART_TOKEN = "0xD95aC89029451c57Adf172192176d7264d49305a" as const;
const TREASURY   = "0x55B26f8CD67632d7AF9a888c645054Ca76E53455" as const;
const USDT_BSC   = "0x55d398326f99059fF775485246999027B3197955" as const;

export const config = {
  app: {
    name: "Saphara",
    primaryChainId: 56, // BNB Smart Chain
  },
  contracts: {
    partToken: (process.env.NEXT_PUBLIC_PART_TOKEN_ADDRESS ?? PART_TOKEN) as `0x${string}`,
    usdtBsc:   (process.env.NEXT_PUBLIC_USDT_BSC_ADDRESS   ?? USDT_BSC)   as `0x${string}`,
    tipping:   (process.env.NEXT_PUBLIC_TIPPING_ADDRESS    ?? ZERO)        as `0x${string}`,
    market:    (process.env.NEXT_PUBLIC_MARKET_ADDRESS     ?? ZERO)        as `0x${string}`,
  },
  treasury: (process.env.NEXT_PUBLIC_TREASURY_ADDRESS ?? TREASURY) as `0x${string}`,

  /* ── PART Fiyat Mekanizması ─────────────────────────────────────────
   *  Taban (floor): $0.01 — platform bu fiyatın altında işlem yapmaz.
   *  Tavan (ceiling): Serbest piyasa tarafından belirlenir; teorik üst sınır
   *    likidite ve buyback programına bağlıdır.
   *  Buyback&Burn: Platform gelirinin %15'i PART geri alım + yakmaya gider.
   *    Bu mekanizma arzı azaltarak fiyatı destekler.
   * ─────────────────────────────────────────────────────────────────── */
  partUsdRate:    Number(process.env.NEXT_PUBLIC_PART_USD_RATE ?? "0.01"), // taban fiyat
  partUsdFloor:   0.01,   // minimum işlem fiyatı (sabit)
  partUsdCeiling: null,   // piyasa tarafından belirlenir (null = sınırsız)

  fees: {
    platformBps:  Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS ?? "250"), // %2.5

    /* ── Gelir Dağılımı (komisyon havuzu) ─────────────────────────
     *  Tüm platform ücretleri (NFT, market, launchpad, reklam, blog)
     *  aşağıdaki oranlarda dağıtılır:
     *
     *    %55 → Staking ödül havuzu   (stake eden kullanıcılara)
     *    %25 → Hazine / Operasyon    (treasury — geliştirme, pazarlama)
     *    %15 → Buyback & Burn        (PART geri alım ve yakma)
     *    %5  → DAO Yönetim Fonu      (topluluk kararları)
     * ──────────────────────────────────────────────────────────── */
    commissionSplit: {
      stakingRewards: 0.55,
      treasury:       0.25,
      buybackBurn:    0.15,
      dao:            0.05,
    },

    /* ── Özelliğe göre ücretler ─────────────────────────────────── */
    blogCreationFeePartAmount: 50,    // blog yazısı açma ücreti
    nftMintFeeFixedPart:       5,     // her mint için sabit platform ücreti
    launchpadFeePct:           3,     // başarılı IDO raise'in %3'ü
    adPartDiscountPct:         20,    // PART ile reklamda %20 indirim
  },

  media: {
    maxVideoSeconds: 180,
    maxUploadMb:     512,
    reelAspect:      "9:16",
  },

  payAssets: ["USDT", "PART", "BNB"] as const,

  /* ── Tier Sistemi (staking bakiyesine göre) ─────────────────── */
  stakingTiers: [
    { name: "Bronz",  minPart: 500,    multiplier: 1,  color: "#cd7f32" },
    { name: "Gümüş",  minPart: 2_000,  multiplier: 4,  color: "#94a3b8" },
    { name: "Altın",  minPart: 5_000,  multiplier: 10, color: "#f0b429" },
    { name: "Elmas",  minPart: 20_000, multiplier: 40, color: "#a5f3fc" },
  ] as const,

  /* ── APY Aralıkları ─────────────────────────────────────────── */
  stakingPools: {
    flexible: { apyMin: 8,  apyMax: 12 },
    "30d":    { apyMin: 18, apyMax: 22 },
    "90d":    { apyMin: 35, apyMax: 42 },
    lp:       { apyMin: 55, apyMax: 80 },
  } as const,
} as const;

export type PayAsset    = typeof config.payAssets[number];
export type SapharaConfig = typeof config;
