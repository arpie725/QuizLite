/*
  Warnings:

  - You are about to drop the column `isComplete` on the `Card` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CompletionStatus" AS ENUM ('NOT_ASSESSED', 'CORRECT', 'WRONG');

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "isComplete",
ADD COLUMN     "status" "CompletionStatus" NOT NULL DEFAULT 'NOT_ASSESSED';
