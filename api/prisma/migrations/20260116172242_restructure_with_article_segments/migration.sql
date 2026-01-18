/*
  Warnings:

  - You are about to drop the column `content` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `articleId` on the `Blank` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Blank` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[articleSegmentId]` on the table `Blank` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `articleSegmentId` to the `Blank` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SegmentType" AS ENUM ('TEXT', 'BLANK');

-- DropForeignKey
ALTER TABLE "Blank" DROP CONSTRAINT "Blank_articleId_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "content",
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Blank" DROP COLUMN "articleId",
DROP COLUMN "position",
ADD COLUMN     "articleSegmentId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpressionProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expressionId" TEXT NOT NULL,
    "timesSeenInArticles" INTEGER NOT NULL DEFAULT 0,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpressionProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleSegment" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "SegmentType" NOT NULL,
    "content" TEXT,

    CONSTRAINT "ArticleSegment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleProgress_userId_articleId_key" ON "ArticleProgress"("userId", "articleId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpressionProgress_userId_expressionId_key" ON "ExpressionProgress"("userId", "expressionId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleSegment_articleId_order_key" ON "ArticleSegment"("articleId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Blank_articleSegmentId_key" ON "Blank"("articleSegmentId");

-- AddForeignKey
ALTER TABLE "ArticleProgress" ADD CONSTRAINT "ArticleProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleProgress" ADD CONSTRAINT "ArticleProgress_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpressionProgress" ADD CONSTRAINT "ExpressionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpressionProgress" ADD CONSTRAINT "ExpressionProgress_expressionId_fkey" FOREIGN KEY ("expressionId") REFERENCES "Expression"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleSegment" ADD CONSTRAINT "ArticleSegment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blank" ADD CONSTRAINT "Blank_articleSegmentId_fkey" FOREIGN KEY ("articleSegmentId") REFERENCES "ArticleSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
