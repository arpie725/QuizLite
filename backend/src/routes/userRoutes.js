import express from 'express';
import prisma from '../prismaClient.js';
import {
  NotFoundError,
  UnauthorizedError,
  InternalError,
  InvalidParamsError,
  DuplicateEntryError,
} from '../utils/errors.js';

const router = express.Router();

// NOTE: middleware authenticates the token before reaching this endpoint!

/*
  retrieves all the sets belonging to the user
    - query the database to find all the sets
    - return the user and the sets
*/
router.get('/sets', async (req, res) => {
  const userId_ = req.userId;
  // interact with the database
  try {
    // get all the sets that belong to the user
    const sets = await prisma.set.findMany({
      where: {
        userId: userId_,
      },
    });
    // remove the userId from each set
    const setsWithoutUserId = sets.map((set) => {
      const { userId, ...rest } = set;
      return rest;
    });
    // get the user
    const user = await prisma.user.findUnique({
      where: {
        id: userId_,
      },
    });
    // return the user and all the sets
    return res.status(201).json({
      success: true,
      message: 'Retrieved all the sets from user',
      data: {
        user: {
          username: user.username,
          setCount: sets.length,
        },
        sets: setsWithoutUserId,
      },
    });
  } catch (er) {
    console.log(er);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
});

export default router;
