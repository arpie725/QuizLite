import prisma from '../prismaClient.js';
import bcrypt from 'bcryptjs';
import { InvalidParamsError, NotFoundError } from './errors.js';

/** checks if the userId exists in the users database
 * @param {number} userId
 * @returns user
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

/** checks if a username already exists in the users database
 *  - ensures the username is trimmed
 * @param {string} username
 * @returns user
 */
async function usernameExists(username) {
  const trimmedUsername = username?.trim();
  // interact with the database
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: trimmedUsername,
      },
    });
    return user;
  } catch (er) {
    throw er;
  }
}

/** validates username and password
 * @params {string} username
 * @params {string} password
 * @returns username, hashed password
 */
async function validateUsernameAndPassword(username, password) {
  const trimmedUsername = username?.trim();
  try {
    // ensure username and password is a non-empty string
    if (!trimmedUsername || !password) {
      throw new InvalidParamsError('Username or Password empty / nonexistent');
    }
    const hashedPassword = bcrypt.hashSync(
      password,
      parseInt(process.env.SALT)
    );
    return { username: trimmedUsername, hashedPassword };
  } catch (er) {
    throw er;
  }
}

export { userExists, usernameExists, validateUsernameAndPassword };
