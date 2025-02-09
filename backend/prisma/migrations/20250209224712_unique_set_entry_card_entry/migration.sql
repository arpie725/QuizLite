/*
  Warnings:

  - A unique constraint covering the columns `[question,answer,setId]` on the table `Card` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,userId]` on the table `Set` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Card_question_answer_setId_key" ON "Card"("question", "answer", "setId");

-- CreateIndex
CREATE UNIQUE INDEX "Set_title_userId_key" ON "Set"("title", "userId");
