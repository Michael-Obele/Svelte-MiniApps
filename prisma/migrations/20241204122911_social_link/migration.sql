-- CreateTable
CREATE TABLE "social_link_pages" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR(255),
    "is_public" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "social_link_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_links" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "url" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "social_link_pages" ADD CONSTRAINT "social_link_pages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "social_link_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
