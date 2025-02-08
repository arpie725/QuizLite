import prisma from '../prismaClient.js';
import {
  InternalError,
  InvalidParamsError,
  NotFoundError,
  UnauthorizedError,
} from './errors.js';

/*
  verifies the setId exists and belongs to the user
  [Params]: setId (int), userId (int)
  [Returns]: set from the database along with the number of cards that belong in the set
*/
async function findAndVerifySet(setId, userId) {
  // interact with the database
  try {
    // check for Nan setId
    if (isNaN(setId) || setId === undefined) {
      throw new InvalidParamsError('Invalid setId provided');
    }
    // find the study set with id == setId
    const curSet = await prisma.set.findUnique({
      where: {
        id: setId,
      },
    });
    if (!curSet) {
      throw new NotFoundError(`Set ${setId} not found`);
    }
    // ensure the set id belongs to the user
    if (curSet.userId != userId) {
      throw new UnauthorizedError('Unauthorized access to the set');
    }
    // find the number of cards that belong to the setId
    const cardCount = await prisma.card.count({
      where: {
        setId: setId,
      },
    });
    // return the set (and cardCount) from the database
    return { curSet, cardCount: cardCount };
  } catch (er) {
    throw er;
  }
}

/*
  determines if a set with the same title already exists
  [Params]: title (string), userId (int)
  [Returns]: boolean of whether the set exists in the database
*/
async function setExists(title, userId) {
  // interacting with database
  try {
    const existingSet = await prisma.set.findFirst({
      where: {
        userId,
        title,
      },
    });
    return !!existingSet;
  } catch (er) {
    throw er;
  }
}

export { findAndVerifySet, setExists };
