/*
  Warnings:

  - Made the column `intervalSeconds` on table `recurringJob` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."recurringJob" ALTER COLUMN "intervalSeconds" SET NOT NULL,
ALTER COLUMN "whenToRun" SET DEFAULT CURRENT_TIMESTAMP;
