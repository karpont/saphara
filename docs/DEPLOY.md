# Testnet'e Deploy (BSC Testnet)

Sozlesmeleri (CreatorTipping + SapharaMarket) BSC Testnet'e deploy etmek icin.
PART token zaten deploy edilmis durumda, tekrar deploy edilmez.

## On kosullar

1. **Test BNB**: deployer cuzdanina BSC Testnet'ten ucretsiz test BNB al
   - Faucet: https://testnet.bnbchain.org/faucet-smart
2. **`.env` doldur** (repo kokunde):

```bash
DEPLOYER_PRIVATE_KEY=0x...        # SADECE test cuzdani! Ana cuzdani ASLA kullanma
TREASURY_ADDRESS=0x55B26f8CD67632d7AF9a888c645054Ca76E53455
NEXT_PUBLIC_PART_TOKEN_ADDRESS=0xD95aC89029451c57Adf172192176d7264d49305a
RPC_URL_BSC_TESTNET=https://data-seed-prebsc-1-s1.bnbchain.org:8545
PLATFORM_FEE_BPS=250
BSCSCAN_API_KEY=...               # (opsiyonel) sozlesme dogrulama icin
```

> GUVENLIK: `DEPLOYER_PRIVATE_KEY` icin yalnizca test amacli, icinde
> deger olmayan ayri bir cuzdan kullan. Ana hesabin (treasury) private
> key'ini buraya ASLA koyma. Treasury sadece adres olarak gecer, imza
> atmaz.

## Komutlar

```bash
cd packages/contracts
pnpm install
pnpm compile                      # uc sozlesme derlenir
pnpm deploy:bsc-testnet           # testnet'e deploy
```

Cikti:
```
PART token dogrulandi (kod mevcut): 0xD95a...
CreatorTipping: 0x....
SapharaMarket:  0x....
.env guncellendi: TIPPING + MARKET adresleri yazildi.
```

Script dönen adresleri otomatik olarak:
- `packages/contracts/deployments/bscTestnet.json` dosyasina,
- repo kokundeki `.env` icine (`NEXT_PUBLIC_TIPPING_ADDRESS`,
  `NEXT_PUBLIC_MARKET_ADDRESS`) yazar.

## Frontend baglantisi

Adresler `.env`'e yazildiktan sonra hicbir kod degisikligi gerekmez —
`packages/config` bu degiskenleri otomatik okur. `pnpm dev` ile baslat.

## Ana aga (mainnet) gecis

Test bittiginde ayni adimlar `pnpm deploy:bsc` ile BSC mainnet'te
calistirilir. Mainnet'te GERCEK BNB harcanir; once testnet'te dogrula.
