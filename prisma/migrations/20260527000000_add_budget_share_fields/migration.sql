-- AlterTable
ALTER TABLE "budgets"
ADD COLUMN "is_public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "share_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "budgets_share_token_key" ON "budgets"("share_token");