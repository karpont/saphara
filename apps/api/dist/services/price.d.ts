export declare const PART_USD_FLOOR = 0.01;
/** Guncel PART/USD oranini doner. */
export declare function getPartUsdRate(): Promise<number>;
/** Owner tarafindan fiyat gunceller. Tabanin altina inemez. */
export declare function setPartUsdRate(rate: number): Promise<{
    rate: number;
}>;
/** USD bedelini guncel orana gore PART miktarina cevirir. */
export declare function usdToPart(usd: number): Promise<number>;
