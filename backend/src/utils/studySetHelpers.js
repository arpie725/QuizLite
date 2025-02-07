import prisma from '../prismaClient.js';
import { InternalError, NotFoundError, UnauthorizedError } from './errors.js';

/*
  verifies the setId exists and belongs to the user
  [Params]: setId (int), userId (int)
  [Returns]: set from the database or throw an error
*/
async function findAndVerifySet(setId, userId) {
  // interact with the database
  try {
    // find the study set with id == setId
    const curSet = await prisma.set.findUnique({
      where: {
        id: setId,
      },
    });
    if (!curSet) {
      throw new NotFoundError('Set not found');
    }
    // ensure the set id belongs to the user
    if (curSet.userId != userId) {
      throw new UnauthorizedError('Unauthorized');
    }
    // return the set from the database (might not need this)
    return curSet;
  } catch (er) {
    if (er instanceof NotFoundError || er instanceof UnauthorizedError) {
      throw er;
    }
    throw new InternalError();
  }
}

/*
  determines if a set already exists
  [Params]: title (string), userId (int)
  [Returns]: boolean of whether the set exists in the database
*/
async function setExists(title, userId) {
  const existingSet = await prisma.set.findFirst({
    where: {
      userId,
      title,
    },
  });
  return !!existingSet;
}

export { findAndVerifySet, setExists };
