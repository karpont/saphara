"use client";

import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { parseUnits } from "viem";
import { config } from "@saphara/config";
import { erc20Abi } from "@saphara/wallet";

/** SapharaMarket ABI (kullanilan fonksiyonlar). */
export const marketAbi = [
  { type: "function", name: "list", stateMutability: "nonpayable", inputs: [{ name: "price", type: "uint256" }, { name: "metadataURI", type: "string" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "purchase", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },
  { type: "function", name: "confirmReceipt", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },
  { type: "function", name: "refund", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },
  { type: "function", name: "openDispute", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },
  { type: "function", name: "listings", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [
    { name: "seller", type: "address" }, { name: "price", type: "uint256" },
    { name: "buyer", type: "address" }, { name: "status", type: "uint8" },
    { name: "metadataURI", type: "string" },
  ] },
] as const;

const MARKET = config.contracts.market;
const PART = config.contracts.partToken;

/**
 * Satin alma akisi:
 *  1) approve(MARKET, price)  — PART token harcama izni
 *  2) purchase(id)            — fon escrow'a
 *  3) (teslim alindiginda) confirmReceipt(id)
 */
export function useMarketActions() {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const approve = (price: string, decimals = 18) =>
    writeContractAsync({
      address: PART, abi: erc20Abi, functionName: "approve",
      args: [MARKET, parseUnits(price, decimals)],
    });

  const purchase = (id: bigint) =>
    writeContractAsync({ address: MARKET, abi: marketAbi, functionName: "purchase", args: [id] });

  const confirmReceipt = (id: bigint) =>
    writeContractAsync({ address: MARKET, abi: marketAbi, functionName: "confirmReceipt", args: [id] });

  const list = (price: string, metadataURI: string, decimals = 18) =>
    writeContractAsync({
      address: MARKET, abi: marketAbi, functionName: "list",
      args: [parseUnits(price, decimals), metadataURI],
    });

  const openDispute = (id: bigint) =>
    writeContractAsync({ address: MARKET, abi: marketAbi, functionName: "openDispute", args: [id] });

  return { address, isPending, approve, purchase, confirmReceipt, list, openDispute };
}

/** Tek bir ilanin zincir uzeri durumunu okur. */
export function useListing(id: bigint) {
  return useReadContract({
    address: MARKET, abi: marketAbi, functionName: "listings", args: [id],
    query: { enabled: MARKET !== "0x0000000000000000000000000000000000000000" },
  });
}

export const LISTING_STATUS = ["Satilik", "Satin Alindi", "Tamamlandi", "Iade", "Anlasmazlik"] as const;
