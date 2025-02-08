import prisma from '../prismaClient.js';
import { NotFoundError } from './errors.js';

/*
  checks if the userId exists in the users database
  - returns user
*/
async function userExists(userId) {
  // interact with the database
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return user;
  } catch (er) {
    throw er;
  }
}

/*
  checks if a username already exists in the users database
  - returns the user
*/
async function usernameExists(username) {
  // interact with the database
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    return user;
  } catch (er) {
    throw er;
  }
}

export { userExists, usernameExists };
