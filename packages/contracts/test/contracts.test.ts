import { expect } from "chai";
import { ethers } from "hardhat";

describe("Saphara sozlesmeleri", () => {
  describe("PartToken", () => {
    it("sabit arzi treasury'ye basar", async () => {
      const [, treasury] = await ethers.getSigners();
      const supply = ethers.parseEther("1000");
      const Part = await ethers.getContractFactory("PartToken");
      const part = await Part.deploy(supply, treasury.address);
      expect(await part.totalSupply()).to.equal(supply);
      expect(await part.balanceOf(treasury.address)).to.equal(supply);
      expect(await part.symbol()).to.equal("PART");
    });

    it("sifir adres treasury'yi reddeder", async () => {
      const Part = await ethers.getContractFactory("PartToken");
      await expect(Part.deploy(1n, ethers.ZeroAddress)).to.be.revertedWith("treasury sifir adres olamaz");
    });
  });

  describe("CreatorTipping", () => {
    it("native bahsiste komisyon ayrilir", async () => {
      const [donor, treasury, creator] = await ethers.getSigners();
      const Tip = await ethers.getContractFactory("CreatorTipping");
      const tip = await Tip.deploy(treasury.address, 250); // %2.5

      const amount = ethers.parseEther("1");
      const creatorBefore = await ethers.provider.getBalance(creator.address);
      await tip.connect(donor).tipNative(creator.address, { value: amount });

      const fee = (amount * 250n) / 10000n;
      const payout = amount - fee;
      expect(await ethers.provider.getBalance(creator.address)).to.equal(creatorBefore + payout);
    });

    it("komisyon ust sinirini (%10) asamaz", async () => {
      const [, treasury] = await ethers.getSigners();
      const Tip = await ethers.getContractFactory("CreatorTipping");
      await expect(Tip.deploy(treasury.address, 1001)).to.be.revertedWith("komisyon ust siniri asildi");
    });
  });

  describe("SapharaMarket", () => {
    async function setup() {
      const [deployer, treasury, seller, buyer] = await ethers.getSigners();
      const Part = await ethers.getContractFactory("PartToken");
      const part = await Part.deploy(ethers.parseEther("10000"), buyer.address); // alici bakiyeli
      const Market = await ethers.getContractFactory("SapharaMarket");
      const market = await Market.deploy(await part.getAddress(), treasury.address, 250);
      return { part, market, seller, buyer, treasury };
    }

    it("escrow akisi: list → purchase → confirm", async () => {
      const { part, market, seller, buyer } = await setup();
      const price = ethers.parseEther("100");

      await market.connect(seller).list(price, "ipfs://urun");
      await part.connect(buyer).approve(await market.getAddress(), price);
      await market.connect(buyer).purchase(0);

      const sellerBefore = await part.balanceOf(seller.address);
      await market.connect(buyer).confirmReceipt(0);

      const fee = (price * 250n) / 10000n;
      expect(await part.balanceOf(seller.address)).to.equal(sellerBefore + price - fee);
    });

    it("satici olmayan refund edemez", async () => {
      const { part, market, seller, buyer } = await setup();
      const price = ethers.parseEther("50");
      await market.connect(seller).list(price, "x");
      await part.connect(buyer).approve(await market.getAddress(), price);
      await market.connect(buyer).purchase(0);
      await expect(market.connect(buyer).refund(0)).to.be.revertedWith("sadece satici");
    });
  });
});
