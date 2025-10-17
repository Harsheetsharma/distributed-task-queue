/*
  Warnings:

  - Added the required column `whenToRun` to the `recurringJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."recurringJob" ADD COLUMN     "whenToRun" TIMESTAMP(3) NOT NULL;
