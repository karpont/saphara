-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverUrl" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "tags" TEXT[],
    "readingMins" INTEGER NOT NULL DEFAULT 5,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "hasPoll" BOOLEAN NOT NULL DEFAULT false,
    "pollQuestion" TEXT,
    "pollOptions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaunchpadProject" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "websiteUrl" TEXT,
    "twitterUrl" TEXT,
    "telegramUrl" TEXT,
    "whitepaperUrl" TEXT,
    "targetAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "raisedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tokenPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalSupply" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "minBuy" DECIMAL(65,30) NOT NULL DEFAULT 100,
    "maxBuy" DECIMAL(65,30) NOT NULL DEFAULT 10000,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "contractAddress" TEXT,
    "chain" TEXT NOT NULL DEFAULT 'BSC',
    "participants" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LaunchpadProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_authorId_idx" ON "BlogPost"("authorId");

-- CreateIndex
CREATE INDEX "BlogPost_category_idx" ON "BlogPost"("category");

-- CreateIndex
CREATE INDEX "BlogPost_createdAt_idx" ON "BlogPost"("createdAt");

-- CreateIndex
CREATE INDEX "BlogPost_featured_idx" ON "BlogPost"("featured");

-- CreateIndex
CREATE INDEX "LaunchpadProject_creatorId_idx" ON "LaunchpadProject"("creatorId");

-- CreateIndex
CREATE INDEX "LaunchpadProject_status_idx" ON "LaunchpadProject"("status");

-- CreateIndex
CREATE INDEX "LaunchpadProject_startAt_idx" ON "LaunchpadProject"("startAt");

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaunchpadProject" ADD CONSTRAINT "LaunchpadProject_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
