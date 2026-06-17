import { createConfig, http } from "wagmi";
import { bsc, bscTestnet, mainnet, polygon, base } from "wagmi/chains";
import { injected, metaMask, walletConnect, coinbaseWallet } from "wagmi/connectors";

/**
 * Saphara cuzdan yapilandirmasi.
 * Birincil ag: BNB Smart Chain (id 56). Test: BSC Testnet (id 97).
 * Diger EVM aglari opsiyonel olarak desteklenir.
 *
 * RPC ve WalletConnect projectId degerleri ortam degiskenlerinden gelir;
 * placeholder'lar config paketinde tanimlidir, kullanici sonra doldurur.
 */

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const bscRpc = process.env.NEXT_PUBLIC_RPC_URL_BSC;

export const supportedChains = [bsc, bscTestnet, mainnet, polygon, base] as const;

// WalletConnect sadece gecerli bir projectId varsa eklenir
const connectors = [
  injected(),
  metaMask(),
  coinbaseWallet({ appName: "Saphara" }),
  ...(projectId ? [walletConnect({ projectId, showQrModal: true })] : []),
];

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors,
  transports: {
    [bsc.id]: http(bscRpc),
    [bscTestnet.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
  },
  ssr: true,
});

export const PRIMARY_CHAIN_ID = bsc.id;
