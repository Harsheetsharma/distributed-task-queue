/*
  Warnings:

  - A unique constraint covering the columns `[keyword]` on the table `recurringJob` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keyword` to the `recurringJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."recurringJob" ADD COLUMN     "keyword" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "recurringJob_keyword_key" ON "public"."recurringJob"("keyword");
