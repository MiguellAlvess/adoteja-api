/*
  Warnings:

  - You are about to drop the `Adoption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Adoption" DROP CONSTRAINT "Adoption_petId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Adoption" DROP CONSTRAINT "Adoption_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Pet" DROP CONSTRAINT "Pet_ownerId_fkey";

-- DropTable
DROP TABLE "public"."Adoption";

-- DropTable
DROP TABLE "public"."Pet";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pets" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "size" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."PetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "photoUrl" TEXT,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."adoptions" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "adopterId" TEXT NOT NULL,
    "status" "public"."AdoptionStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "adoptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "public"."accounts"("email");

-- CreateIndex
CREATE INDEX "pets_ownerId_idx" ON "public"."pets"("ownerId");

-- CreateIndex
CREATE INDEX "adoptions_petId_idx" ON "public"."adoptions"("petId");

-- CreateIndex
CREATE INDEX "adoptions_adopterId_idx" ON "public"."adoptions"("adopterId");

-- AddForeignKey
ALTER TABLE "public"."pets" ADD CONSTRAINT "pets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."adoptions" ADD CONSTRAINT "adoptions_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."adoptions" ADD CONSTRAINT "adoptions_adopterId_fkey" FOREIGN KEY ("adopterId") REFERENCES "public"."accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
