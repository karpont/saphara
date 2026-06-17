import { describe, it, expect } from "vitest";
import { ctr, engagementRate } from "../src/index";

describe("analytics", () => {
  it("ctr dogru hesaplar", () => {
    expect(ctr(20, 1000)).toBeCloseTo(0.02);
    expect(ctr(0, 0)).toBe(0); // sifira bolme korumasi
  });
  it("engagementRate dogru hesaplar", () => {
    expect(engagementRate(50, 500)).toBeCloseTo(0.1);
    expect(engagementRate(10, 0)).toBe(0);
  });
});
