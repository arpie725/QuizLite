import prisma from '../prismaClient.js';
import {
  InternalError,
  InvalidParamsError,
  NotFoundError,
  UnauthorizedError,
  handleErrors,
} from './errors.js';

/** verifies the set exists and belongs to the user
 * @param {number} setId
 * @param {number} userId
 * @returns curSet (with userId removed) with cardCount
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
    // remove the userId from the set
    const { userId: _, ...curSetWithoutUserId } = curSet;
    // find the number of cards that belong to the setId
    const cardCount = await prisma.card.count({
      where: {
        setId: setId,
      },
    });
    // return the set (and cardCount) from the database
    return { curSet: curSetWithoutUserId, cardCount };
  } catch (er) {
    throw er;
  }
}

/** determines if a set with the same title already exists
 * @param {string} title
 * @param {number} userId
 * @returns boolean
 */
async function setExists(title, userId) {
  // interacting with database
  try {
    const existingSet = await prisma.set.findUnique({
      where: {
        title_userId: { title, userId },
      },
    });
    return !!existingSet;
  } catch (er) {
    throw er;
  }
}

/** verifies each
 *
 */

export { findAndVerifySet, setExists };
