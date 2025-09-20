/*
  Warnings:

  - You are about to drop the column `city` on the `pets` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `pets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."pets" DROP COLUMN "city",
DROP COLUMN "state";
