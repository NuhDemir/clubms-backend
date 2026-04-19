-- CreateTable
CREATE TABLE "clubs_clubs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "logo_url" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clubs_clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs_memberships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "club_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clubs_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "club_id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clubs_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clubs_clubs_name_key" ON "clubs_clubs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_memberships_club_id_user_id_key" ON "clubs_memberships"("club_id", "user_id");

-- AddForeignKey
ALTER TABLE "clubs_memberships" ADD CONSTRAINT "clubs_memberships_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs_clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clubs_documents" ADD CONSTRAINT "clubs_documents_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs_clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
