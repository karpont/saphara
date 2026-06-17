-- Migration: add vesting fields to LaunchpadProject
ALTER TABLE "LaunchpadProject" ADD COLUMN IF NOT EXISTS "tgeUnlockPct" INTEGER NOT NULL DEFAULT 15;
ALTER TABLE "LaunchpadProject" ADD COLUMN IF NOT EXISTS "cliffMonths" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "LaunchpadProject" ADD COLUMN IF NOT EXISTS "linearMonths" INTEGER NOT NULL DEFAULT 9;
