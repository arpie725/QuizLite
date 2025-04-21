/*
  Warnings:

  - You are about to drop the column `completed` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the `_CardTags` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `setId` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_userId_fkey";

-- DropForeignKey
ALTER TABLE "_CardTags" DROP CONSTRAINT "_CardTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_CardTags" DROP CONSTRAINT "_CardTags_B_fkey";

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "completed",
DROP COLUMN "userId",
ADD COLUMN     "isComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "setId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_CardTags";

-- CreateTable
CREATE TABLE "Set" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SetTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SetTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SetTags_B_index" ON "_SetTags"("B");

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SetTags" ADD CONSTRAINT "_SetTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Set"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SetTags" ADD CONSTRAINT "_SetTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
