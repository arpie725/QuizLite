-- DropForeignKey
ALTER TABLE "Set" DROP CONSTRAINT "Set_userId_fkey";

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
