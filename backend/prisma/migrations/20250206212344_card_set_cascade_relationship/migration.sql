-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_setId_fkey";

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set"("id") ON DELETE CASCADE ON UPDATE CASCADE;
