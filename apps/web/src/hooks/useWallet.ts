"use client";

/**
 * Wagmi hook'larını apps/web'in kendi wagmi instance'ından import eder.
 * packages/wallet'ın ayrı wagmi instance'ından import ETMEZ —
 * bu WagmiProviderNotFoundError'un kök nedenidir.
 */

import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useReadContract,
} from "wagmi";
import { formatUnits } from "viem";
import { PRIMARY_CHAIN_ID } from "@saphara/wallet";
import { erc20Abi } from "@saphara/wallet";

export function useWallet() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, status: connectStatus } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: nativeBalance } = useBalance({ address });

  const onWrongNetwork = isConnected && chainId !== PRIMARY_CHAIN_ID;

  return {
    address,
    isConnected,
    chainId,
    onWrongNetwork,
    nativeBalance,
    connectors,
    connectStatus,
    connect,
    disconnect,
    switchToPrimary: () => switchChain({ chainId: PRIMARY_CHAIN_ID }),
  };
}

export function usePartBalance(tokenAddress?: `0x${string}`) {
  const { address } = useAccount();

  const { data: rawBalance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(tokenAddress && address) },
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: Boolean(tokenAddress) },
  });

  const formatted =
    rawBalance && decimals !== undefined
      ? formatUnits(rawBalance as bigint, decimals as number)
      : "0";

  return { raw: rawBalance as bigint | undefined, formatted };
}
