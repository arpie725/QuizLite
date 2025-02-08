import prisma from '../prismaClient.js';
import { NotFoundError } from './errors.js';

/*
  determines if a card with (question, answer, setId) exists in the database
    - queries the database
    - returns boolean
*/
async function cardQASExists(question, answer, setId) {
  // interacting with database
  try {
    const existingCard = await prisma.card.findFirst({
      where: {
        question,
        answer,
        setId,
      },
    });
    return !!existingCard;
  } catch (er) {
    throw er;
  }
}

/*
  determines if the cardId exists in the cards database
    - queries the database
    - returns the card
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

export { cardQASExists, cardExists };
