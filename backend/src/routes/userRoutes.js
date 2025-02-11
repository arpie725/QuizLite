import express from 'express';
import prisma from '../prismaClient.js';
import { userExists } from '../utils/authHelpers.js';

const router = express.Router();

// NOTE: middleware authenticates the token before reaching this endpoint!

/** retrieves all the sets belonging to the user
 *  - query the database to find all the sets
 *  - return user and sets
 */
router.get('/sets', async (req, res) => {
  const userId = req.userId;
  // interact with the database
  try {
    // get all the sets that belong to the user
    const sets = await prisma.set.findMany({
      where: {
        userId,
      },
    });
    // remove the userId from each set
    const setsWithoutUserId = sets.map((set) => {
      const { userId: _, ...rest } = set;
      return rest;
    });
    // get the user
    const user = await userExists(userId);
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
    // expected error
    return handleErrors(er, res);
  }
});

/** retrieves all the tags belonging to the user
 *  - query the database to find all tags
 *  - return user and tags
 */
router.get('/tags', async (req, res) => {
  const userId = req.userId;
  // interact with the database
  try {
    const tags = await prisma.tag.findMany({
      where: {
        userId,
      },
    });
    // remove the userId from each tag
    const tagsWithoutUserId = tags.map(({ userId: _, ...rest }) => rest);
    // return the tags
    return res.status(201).json({
      success: true,
      message: 'Retrieved all the tags from user',
      data: {
        tags: { tagsWithoutUserId },
      },
    });
  } catch (er) {
    // expected error
    return handleErrors(er, res);
  }
});

/*
  deletes a user from the database
    - query the database
    - return 204 code
*/
router.delete('/', async (req, res) => {
  const userId = req.userId;
  // interact with the database
  try {
    // delete the user from the database
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    return res.sendStatus(204);
  } catch (er) {
    // expected error
    return handleErrors(er, res);
  }
});

export default router;
