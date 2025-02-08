import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';
import { usernameExists } from '../utils/authHelpers.js';
import {
  DuplicateEntryError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors.js';

const router = express.Router();

/*
  registers a new user
    - checks if the username already exists in the db
    - adds the new user into the db
    - creates a token for the new user 
    - returns the token to the client
*/
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const trimmedUsername = username?.trim();
  // check validity of username / password
  if (
    !trimmedUsername ||
    trimmedUsername === '' ||
    !password ||
    password === ''
  ) {
    return res.status(404).json({
      success: false,
      errorType: 'InvalidParamsError',
      message: 'Username or Password empty / nonexistent',
    });
  }
  // hash the password
  const hashedPassword = bcrypt.hashSync(password, parseInt(process.env.SALT));
  // interacting with the database
  try {
    // check if the username already exists
    const existingUser = await usernameExists(trimmedUsername);
    if (existingUser) {
      throw new DuplicateEntryError('Username already exists');
    }
    // add the user and hashed password into the database
    const newUser = await prisma.user.create({
      data: {
        username: trimmedUsername,
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
      message: `${trimmedUsername} registered successfully`,
      data: {
        token: token,
      },
    });
  } catch (er) {
    if (er instanceof DuplicateEntryError) {
      return res
        .status(er.statusCode)
        .json({ success: false, errorType: er.name, message: er.message });
    }
    console.log(er);
    return res
      .status(503)
      .json({ sucess: false, message: 'Internal server error' });
  }
});

/*
  log in an existing user
    - checks if the username exists in the db
    - compares the password with the one in the db
    - returns the token to the client
*/
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const trimmedUsername = username?.trim();
  if (
    !trimmedUsername ||
    trimmedUsername === '' ||
    !password ||
    password === ''
  ) {
    return res.status(404).json({
      success: false,
      errorType: 'InvalidParamsError',
      message: 'Username or Password empty / nonexistent',
    });
  }
  try {
    // check that the username exists in the db
    const user = await usernameExists(trimmedUsername);
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
        token: token,
      },
    });
  } catch (er) {
    if (er instanceof NotFoundError || er instanceof UnauthorizedError) {
      return res
        .status(er.statusCode)
        .json({ success: false, errorType: er.name, message: er.message });
    }
    console.log(er);
    return res
      .status(503)
      .json({ success: false, message: 'Internal server error' });
  }
});

export default router;
