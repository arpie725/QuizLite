import prisma from '../prismaClient.js';
import { NotFoundError } from './errors.js';

/*
  checks if the user exists in the database
  - returns boolean
*/
async function userExists(userId) {
  // interact with the database
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return !!user;
  } catch (er) {
    throw er;
  }
}

export { userExists };
