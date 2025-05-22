-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyAnimationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastAnimationDate" TIMESTAMP(3);
