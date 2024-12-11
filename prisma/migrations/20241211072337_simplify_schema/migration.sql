-- AlterTable
ALTER TABLE "social_link_pages" ALTER COLUMN "title" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "social_links" ALTER COLUMN "label" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "username" SET DATA TYPE TEXT,
ALTER COLUMN "githubId" SET DATA TYPE TEXT,
ALTER COLUMN "googleId" SET DATA TYPE TEXT;
