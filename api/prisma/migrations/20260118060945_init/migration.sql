-- CreateEnum
CREATE TYPE "SegmentType" AS ENUM ('TEXT', 'BLANK');

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
CREATE TABLE "Expression" (
    "id" TEXT NOT NULL,
    "french" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "ArticleExpression" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "expressionId" TEXT NOT NULL,

    CONSTRAINT "ArticleExpression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blank" (
    "id" TEXT NOT NULL,
    "articleSegmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Blank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "error" TEXT,
    "blankId" TEXT NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "ArticleExpression_articleId_expressionId_key" ON "ArticleExpression"("articleId", "expressionId");

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
ALTER TABLE "ArticleExpression" ADD CONSTRAINT "ArticleExpression_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleExpression" ADD CONSTRAINT "ArticleExpression_expressionId_fkey" FOREIGN KEY ("expressionId") REFERENCES "Expression"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blank" ADD CONSTRAINT "Blank_articleSegmentId_fkey" FOREIGN KEY ("articleSegmentId") REFERENCES "ArticleSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_blankId_fkey" FOREIGN KEY ("blankId") REFERENCES "Blank"("id") ON DELETE CASCADE ON UPDATE CASCADE;
