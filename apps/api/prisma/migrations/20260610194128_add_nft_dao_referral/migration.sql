-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "buyerAddress" TEXT,
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'digital',
ADD COLUMN     "commissionPct" DECIMAL(65,30) NOT NULL DEFAULT 2.5,
ADD COLUMN     "nftTokenId" TEXT,
ADD COLUMN     "soldAt" TIMESTAMP(3),
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "NftCollection" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "bannerUrl" TEXT,
    "mintPrice" DECIMAL(65,30) NOT NULL,
    "whitelistPrice" DECIMAL(65,30),
    "maxSupply" INTEGER NOT NULL,
    "minted" INTEGER NOT NULL DEFAULT 0,
    "maxPerWallet" INTEGER NOT NULL DEFAULT 5,
    "royaltyPct" DECIMAL(65,30) NOT NULL DEFAULT 2.5,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "chain" TEXT NOT NULL DEFAULT 'BSC',
    "contractAddress" TEXT,
    "metadataBase" TEXT,
    "revealAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NftCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NftToken" (
    "id" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "collectionId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "minterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "attributes" JSONB,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "listed" BOOLEAN NOT NULL DEFAULT false,
    "listingPrice" DECIMAL(65,30),
    "txHash" TEXT,
    "mintedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "soldAt" TIMESTAMP(3),
    "salePrice" DECIMAL(65,30),

    CONSTRAINT "NftToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NftWhitelist" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slots" INTEGER NOT NULL DEFAULT 1,
    "used" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NftWhitelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DaoProposal" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'general',
    "status" TEXT NOT NULL DEFAULT 'active',
    "votesFor" INTEGER NOT NULL DEFAULT 0,
    "votesAgainst" INTEGER NOT NULL DEFAULT 0,
    "votesAbstain" INTEGER NOT NULL DEFAULT 0,
    "quorum" INTEGER NOT NULL DEFAULT 50,
    "passThreshold" INTEGER NOT NULL DEFAULT 60,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "executedAt" TIMESTAMP(3),
    "treasuryAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "treasuryRecipient" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DaoProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DaoVote" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "votePower" INTEGER NOT NULL DEFAULT 1,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DaoVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralEntry" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "rewardPart" DECIMAL(65,30) NOT NULL DEFAULT 50,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NftCollection_creatorId_idx" ON "NftCollection"("creatorId");

-- CreateIndex
CREATE INDEX "NftCollection_status_idx" ON "NftCollection"("status");

-- CreateIndex
CREATE INDEX "NftToken_ownerId_idx" ON "NftToken"("ownerId");

-- CreateIndex
CREATE INDEX "NftToken_collectionId_idx" ON "NftToken"("collectionId");

-- CreateIndex
CREATE INDEX "NftToken_listed_idx" ON "NftToken"("listed");

-- CreateIndex
CREATE UNIQUE INDEX "NftToken_collectionId_tokenId_key" ON "NftToken"("collectionId", "tokenId");

-- CreateIndex
CREATE INDEX "NftWhitelist_collectionId_idx" ON "NftWhitelist"("collectionId");

-- CreateIndex
CREATE INDEX "NftWhitelist_userId_idx" ON "NftWhitelist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NftWhitelist_collectionId_userId_key" ON "NftWhitelist"("collectionId", "userId");

-- CreateIndex
CREATE INDEX "DaoProposal_authorId_idx" ON "DaoProposal"("authorId");

-- CreateIndex
CREATE INDEX "DaoProposal_status_idx" ON "DaoProposal"("status");

-- CreateIndex
CREATE INDEX "DaoProposal_endsAt_idx" ON "DaoProposal"("endsAt");

-- CreateIndex
CREATE INDEX "DaoVote_proposalId_idx" ON "DaoVote"("proposalId");

-- CreateIndex
CREATE INDEX "DaoVote_voterId_idx" ON "DaoVote"("voterId");

-- CreateIndex
CREATE UNIQUE INDEX "DaoVote_proposalId_voterId_key" ON "DaoVote"("proposalId", "voterId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralEntry_referredId_key" ON "ReferralEntry"("referredId");

-- CreateIndex
CREATE INDEX "ReferralEntry_referrerId_idx" ON "ReferralEntry"("referrerId");

-- CreateIndex
CREATE INDEX "Listing_category_idx" ON "Listing"("category");

-- CreateIndex
CREATE INDEX "Listing_createdAt_idx" ON "Listing"("createdAt");

-- AddForeignKey
ALTER TABLE "NftCollection" ADD CONSTRAINT "NftCollection_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NftToken" ADD CONSTRAINT "NftToken_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "NftCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NftToken" ADD CONSTRAINT "NftToken_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NftToken" ADD CONSTRAINT "NftToken_minterId_fkey" FOREIGN KEY ("minterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NftWhitelist" ADD CONSTRAINT "NftWhitelist_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "NftCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NftWhitelist" ADD CONSTRAINT "NftWhitelist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DaoProposal" ADD CONSTRAINT "DaoProposal_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DaoVote" ADD CONSTRAINT "DaoVote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "DaoProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DaoVote" ADD CONSTRAINT "DaoVote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralEntry" ADD CONSTRAINT "ReferralEntry_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralEntry" ADD CONSTRAINT "ReferralEntry_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
