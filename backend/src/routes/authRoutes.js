import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

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
  // hash the password
  const hashedPassword = bcrypt.hashSync(password, parseInt(process.env.SALT));
  // check if the username already exists (not unique)
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    // check if user was found
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'Username already exists' });
    }
    // add the user and hashed password into the database
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    // create a token to be returned
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });
    // send back the token to the user (as json)
    res.status(201).json({
      success: true,
      message: `${username} registered successfully`,
      data: {
        token: token,
      },
    });
  } catch (er) {
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
  // hash the password the user sent
  const hashedPassword = bcrypt.hashSync(password, parseInt(process.env.SALT));
  // check that the username exists in the db
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    // user might not exist
    if (!user) {
      console.log('User not found');
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    // compare passwords (user inputted password --> hashed)
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      console.log('Incorrect password');
      return res.status(401).json({
        success: false,
        message: 'Incorrect password',
      });
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
    console.log(er);
    return res
      .status(503)
      .json({ success: false, message: 'Internal server error' });
  }
});

export default router;
