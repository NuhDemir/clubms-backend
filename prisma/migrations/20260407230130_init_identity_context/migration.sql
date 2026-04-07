-- CreateTable
CREATE TABLE "identity_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_number" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "firebase_uid" VARCHAR(128) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identity_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity_global_roles" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "role_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "identity_global_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "identity_users_student_number_key" ON "identity_users"("student_number");

-- CreateIndex
CREATE UNIQUE INDEX "identity_users_email_key" ON "identity_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "identity_users_firebase_uid_key" ON "identity_users"("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "identity_global_roles_user_id_key" ON "identity_global_roles"("user_id");

-- AddForeignKey
ALTER TABLE "identity_global_roles" ADD CONSTRAINT "identity_global_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "identity_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
