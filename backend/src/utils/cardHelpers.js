import prisma from '../prismaClient.js';
import { InvalidParamsError } from './errors.js';

/** determines if a card with (question, answer, setId) already exists
 * @param {string} question
 * @param {string} answer
 * @param {number} setId
 * @returns card
 */
async function cardQASExists(question, answer, setId) {
  // interacting with database
  try {
    const existingCard = await prisma.card.findUnique({
      where: {
        question_answer_setId: { question, answer, setId },
      },
    });
    return existingCard;
  } catch (er) {
    throw er;
  }
}

/** determines if the cardId exists in the database
 * @param {number} cardId
 * @returns card
 */
async function cardExists(cardId) {
  // interacting with the database
  try {
    const curCard = await prisma.card.findUnique({
      where: {
        id: cardId,
      },
    });
    return curCard;
  } catch (er) {
    throw er;
  }
}

/** validates question and answer
 * @params {string} question
 * @params {string} answer
 * @returns trimmed question and trimmed answer
 */
async function validateQuestionAndAnswer(question, answer) {
  const trimmedQuestion = question?.trim();
  const trimmedAnswer = answer?.trim();

  try {
    // check if invalid question, answer, or setId
    if (!trimmedQuestion || !trimmedAnswer) {
      throw new InvalidParamsError(
        'Cannot have empty question, answer, or undefined setId'
      );
    }
    return { question: trimmedQuestion, answer: trimmedAnswer };
  } catch (er) {
    throw er;
  }
}

export { cardQASExists, cardExists, validateQuestionAndAnswer };
