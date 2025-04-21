import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';
import {
  usernameExists,
  validateUsernameAndPassword,
} from '../utils/authHelpers.js';
import {
  DuplicateEntryError,
  NotFoundError,
  UnauthorizedError,
  handleErrors,
} from '../utils/errors.js';

const router = express.Router();

/** registers a new user
 * - checks if the username already exists in the db
 * - adds the new user into the db
 * - creates a token for the new user
 * - returns username and token
 */
router.post('/register', async (req, res) => {
  const { username: rawUsername, password } = req.body;
  // interacting with the database
  try {
    // check validity of username / password
    const { username, hashedPassword } = await validateUsernameAndPassword(
      rawUsername,
      password
    );
    // check if the username already exists
    const existingUser = await usernameExists(username);
    if (existingUser) {
      throw new DuplicateEntryError('Username already exists');
    }
    // add the user and hashed password into the database
    const newUser = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
      },
    });
    // create a token to be returned
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });
    // send back the token to the user
    return res.status(201).json({
      success: true,
      message: `${username} registered successfully`,
      data: {
        username,
        token,
      },
    });
  } catch (er) {
    // expected error
    return handleErrors(er, res);
  }
});

/** logs in an existing user
 * - checks if the username exists in the db
 * - compares the password with the one in the db
 * - returns the username and token
 */
router.post('/login', async (req, res) => {
  const { username: rawUsername, password } = req.body;

  try {
    // validate username / password
    const { username } = await validateUsernameAndPassword(
      rawUsername,
      password
    );
    // check that the username exists in the db
    const user = await usernameExists(username);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    // compare passwords (user inputted password --> hashed)
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedError('Incorrect password');
    }
    // create the token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });
    // return the token to the client
    res.status(200).json({
      success: true,
      message: 'Successfully logged in',
      data: {
        username,
        token: token,
      },
    });
  } catch (er) {
    // expected error
    return handleErrors(er, res);
  }
});

export default router;
