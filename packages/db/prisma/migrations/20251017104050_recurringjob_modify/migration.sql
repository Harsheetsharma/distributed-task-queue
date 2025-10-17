-- AlterTable
ALTER TABLE "public"."recurringJob" ADD COLUMN     "runAfter" TIMESTAMP(3),
ALTER COLUMN "intervalSeconds" DROP NOT NULL;
