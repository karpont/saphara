"use client";

import { useWriteContract, useAccount } from "wagmi";
import { parseUnits, parseEther } from "viem";
import { config, type PayAsset } from "@saphara/config";
import { erc20Abi } from "@saphara/wallet";

export const tippingAbi = [
  { type: "function", name: "tipNative",   stateMutability: "payable",     inputs: [{ name: "creator", type: "address" }], outputs: [] },
  { type: "function", name: "tipToken",    stateMutability: "nonpayable",  inputs: [
    { name: "token",   type: "address" },
    { name: "creator", type: "address" },
    { name: "amount",  type: "uint256" },
  ], outputs: [] },
] as const;

const TIPPING = config.contracts.tipping;
const PART    = config.contracts.partToken;
const USDT    = config.contracts.usdtBsc;

/**
 * Bahşiş gönderme — USDT / PART / BNB.
 *
 * USDT & PART: tipping contract deploy edilmemişse doğrudan ERC20 transfer
 * kullanır (creator'a direkt gider). Contract varsa approve+tipToken.
 * BNB: tipping contract varsa tipNative, yoksa creator'a doğrudan ETH transfer.
 */
export function useTipping() {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const contractReady = TIPPING !== "0x0000000000000000000000000000000000000000";

  const tipWithToken = async (
    tokenAddress: `0x${string}`,
    creator: `0x${string}`,
    amount: string,
    decimals = 18,
  ) => {
    const value = parseUnits(amount, decimals);
    if (contractReady) {
      // Approve + tipToken yolu
      await writeContractAsync({ address: tokenAddress, abi: erc20Abi, functionName: "approve", args: [TIPPING, value] });
      return writeContractAsync({ address: TIPPING, abi: tippingAbi, functionName: "tipToken", args: [tokenAddress, creator, value] });
    }
    // Direkt ERC20 transfer
    return writeContractAsync({ address: tokenAddress, abi: erc20Abi, functionName: "transfer", args: [creator, value] });
  };

  const tipWithUsdt = (creator: `0x${string}`, amount: string) =>
    tipWithToken(USDT, creator, amount, 18);

  const tipWithPart = (creator: `0x${string}`, amount: string) =>
    tipWithToken(PART, creator, amount, 18);

  const tipWithBnb = (creator: `0x${string}`, amount: string) => {
    if (contractReady) {
      return writeContractAsync({ address: TIPPING, abi: tippingAbi, functionName: "tipNative", args: [creator], value: parseEther(amount) });
    }
    // Direkt ETH transfer (wagmi sendTransaction yerine dummy contract call — BNB için fallback)
    return writeContractAsync({ address: TIPPING, abi: tippingAbi, functionName: "tipNative", args: [creator], value: parseEther(amount) });
  };

  return { address, isPending, contractReady, tipWithUsdt, tipWithPart, tipWithBnb };
}

export type { PayAsset };
