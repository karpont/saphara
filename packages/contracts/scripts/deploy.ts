import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * PART token ZATEN deploy edilmis (adres .env'de). Bu script:
 *  1) PART token adresinde gercekten sozlesme kodu var mi dogrular,
 *  2) CreatorTipping ve SapharaMarket'i deploy eder,
 *  3) Dönen adresleri JSON'a ve repo kokundeki .env'e otomatik yazar.
 */
async function main() {
  const treasury = process.env.TREASURY_ADDRESS;
  const partToken = process.env.NEXT_PUBLIC_PART_TOKEN_ADDRESS ?? process.env.PART_TOKEN_ADDRESS;
  if (!treasury) throw new Error("TREASURY_ADDRESS gerekli (.env)");
  if (!partToken) throw new Error("PART_TOKEN_ADDRESS gerekli (.env)");

  const feeBps = Number(process.env.PLATFORM_FEE_BPS ?? "250"); // %2.5

  const [deployer] = await ethers.getSigners();
  console.log("Ag:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("Bakiye:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

  // 1) PART token adresinde kod var mi?
  const code = await ethers.provider.getCode(partToken);
  if (code === "0x") {
    throw new Error(`UYARI: ${partToken} adresinde sozlesme kodu YOK (bu agda). Dogru agda misin?`);
  }
  console.log("PART token dogrulandi (kod mevcut):", partToken);
  console.log("Treasury:", treasury, "| Komisyon: %" + (feeBps / 100));

  // 2) Deploy
  const Tipping = await ethers.getContractFactory("CreatorTipping");
  const tipping = await Tipping.deploy(treasury, feeBps);
  await tipping.waitForDeployment();
  const tippingAddr = await tipping.getAddress();
  console.log("CreatorTipping:", tippingAddr);

  const Market = await ethers.getContractFactory("SapharaMarket");
  const market = await Market.deploy(partToken, treasury, feeBps);
  await market.waitForDeployment();
  const marketAddr = await market.getAddress();
  console.log("SapharaMarket:", marketAddr);

  // 3) Kaydet
  const out = {
    network: network.name,
    partToken,
    treasury,
    tipping: tippingAddr,
    market: marketAddr,
    feeBps,
    deployedAt: new Date().toISOString(),
  };
  const deployDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(deployDir, { recursive: true });
  fs.writeFileSync(path.join(deployDir, `${network.name}.json`), JSON.stringify(out, null, 2));
  console.log(`\nKaydedildi: deployments/${network.name}.json`);

  // Repo kokundeki .env'i guncelle (varsa)
  updateEnv(tippingAddr, marketAddr);

  console.log("\n✓ Tamamlandi. Adresler .env'e yazildi (varsa). Frontend artik baglanmaya hazir.");
}

function updateEnv(tipping: string, market: string) {
  const envPath = path.join(__dirname, "..", "..", "..", ".env");
  if (!fs.existsSync(envPath)) {
    console.log("(.env bulunamadi — adresleri elle ekle:)");
    console.log(`NEXT_PUBLIC_TIPPING_ADDRESS=${tipping}`);
    console.log(`NEXT_PUBLIC_MARKET_ADDRESS=${market}`);
    return;
  }
  let env = fs.readFileSync(envPath, "utf8");
  const upsert = (key: string, val: string) => {
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(env)) env = env.replace(re, `${key}=${val}`);
    else env += `\n${key}=${val}`;
  };
  upsert("NEXT_PUBLIC_TIPPING_ADDRESS", tipping);
  upsert("NEXT_PUBLIC_MARKET_ADDRESS", market);
  fs.writeFileSync(envPath, env);
  console.log(".env guncellendi: TIPPING + MARKET adresleri yazildi.");
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
