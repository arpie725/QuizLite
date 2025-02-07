import express from 'express';
import prisma from '../prismaClient.js';
import { findAndVerifySet, setExists } from '../utils/studySetHelpers.js';
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
  creates a new study set
    - ensures the user is not adding an already created study set
    - adds a new set entry into the database
    - creates a default flashcard for new study sets
    - returns the newly created study set
*/
router.post('/', async (req, res) => {
  const { title, isPublic } = req.body;
  const userId_ = req.userId;
  // interact with the db
  try {
    // check if title is empty or undefined
    if (!title) {
      throw new InvalidParamsError('Title cannot be empty');
    }
    // check the set already exists
    if (await setExists(title, userId_)) {
      throw new DuplicateEntryError(
        `Study set with with title: ${title} and userId: ${userId_} already exists`
      );
    }
    // add the new study set entry into the database
    const newSet = await prisma.set.create({
      data: {
        title,
        isPublic,
        user: { connect: { id: userId_ } },
      },
    });
    // remove the userId from the set
    const { userId, ...setWithoutUserId } = newSet;
    // create a default flashcard
    await prisma.card.create({
      data: {
        question: 'What color is the sky',
        answer: 'Blue!',
        set: { connect: { id: newSet.id } },
      },
    });
    // return the newly created set
    return res.status(201).json({
      success: true,
      message: 'Created a new study set',
      data: {
        set: {
          ...setWithoutUserId,
        },
      },
    });
  } catch (er) {
    if (er instanceof InvalidParamsError || er instanceof DuplicateEntryError) {
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

/*
  edits an existing study set
    - can be (title, isPublic, etc.)
    - ensures the study setId belongs to the user
    - updates the title field
    - returns the updated set
*/
router.put('/:setId', async (req, res) => {
  const setId = parseInt(req.params.setId);
  const userId_ = req.userId;
  const { title, isPublic } = req.body;
  // interact with the database
  try {
    // check if the title is empty string
    if (title === '') {
      throw new InvalidParamsError('Title cannot be empty');
    }
    // verify setId exists and belongs to the user
    await findAndVerifySet(setId, userId_);
    // update the title
    const updatedSet = await prisma.set.update({
      where: {
        id: setId,
      },
      data: {
        title,
        isPublic,
      },
    });
    // remove the userId from the set
    const { userId, ...setWithoutUserId } = updatedSet;
    // return the updated set
    return res.status(200).json({
      success: true,
      message: 'Updated the study set',
      data: {
        set: {
          ...setWithoutUserId,
        },
      },
    });
  } catch (er) {
    if (
      er instanceof NotFoundError ||
      er instanceof UnauthorizedError ||
      er instanceof InternalError ||
      er instanceof InvalidParamsError
    ) {
      return res
        .status(er.statusCode)
        .json({ success: false, errorType: er.name, message: er.message });
    }
    console.log(er);
    res.status(500).json({ success: false, message: er });
  }
});

/*
  deletes an existing study set
    - ensures setId belongs to the user
    - deletes the study set from the sets database
    - returns 204 status
*/
router.delete('/:setId', async (req, res) => {
  const setId = parseInt(req.params.setId);
  const userId = req.userId;
  // interact with the database
  try {
    // verify setId exists and belongs to the user
    await findAndVerifySet(setId, userId);
    // delete the study set from the database
    await prisma.set.delete({
      where: {
        id: setId,
      },
    });
    // send back a 204 status
    return res.sendStatus(204); // 204 means no content
  } catch (er) {
    if (
      er instanceof NotFoundError ||
      er instanceof UnauthorizedError ||
      er instanceof InternalError ||
      er instanceof InvalidParamsError
    ) {
      return res
        .status(er.statusCode)
        .json({ success: false, errorType: er.name, message: er.message });
    }
    console.log(er);
    return res.status(500).json({ success: false, message: er });
  }
});

/*
  retrieves the study set from the database
    - ensures setId belongs to the user
    - queries the database for the study set
    - returns the study set
*/
router.get('/:setId/', async (req, res) => {
  const setId = parseInt(req.params.setId);
  const userId_ = req.userId;
  // interact with the database
  try {
    // verify the setId exists and belongs to the user
    const { curSet, cardCount } = await findAndVerifySet(setId, userId_);
    // remove the userId from the set
    const { userId, ...setWithoutUserId } = curSet;
    // return the set from the database
    return res.status(201).json({
      success: true,
      message: 'Retrieved the set',
      data: {
        set: {
          ...setWithoutUserId,
          cardCount,
        },
      },
    });
  } catch (er) {
    if (
      er instanceof InvalidParamsError ||
      er instanceof NotFoundError ||
      er instanceof UnauthorizedError
    ) {
      return res
        .status(er.statusCode)
        .json({ success: false, errorType: er.name, message: er.message });
    }
    console.log(er);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
});

/*
  retrieves all cards belonging to a study set
    - ensures the setId belongs to the user
    - queries the database for all cards that have desired setId
    - returns the study set and all cards 
*/
router.get('/:setId/cards', async (req, res) => {
  const setId = parseInt(req.params.setId);
  const userId_ = req.userId;
  // interact with the database
  try {
    // verify study set belongs to user
    const { curSet, cardCount } = await findAndVerifySet(setId, userId_);
    // remove the userId from the set
    const { userId, ...setWithoutUserId } = curSet;
    // query the database for all cards that have setId
    const cards = await prisma.card.findMany({
      where: {
        setId: setId,
      },
    });
    // return the curSet and cards
    return res.status(201).json({
      success: true,
      message: 'Retrieved all cards from set',
      data: {
        set: {
          ...setWithoutUserId,
          cardCount,
        },
        cards,
      },
    });
  } catch (er) {
    if (
      er instanceof NotFoundError ||
      er instanceof UnauthorizedError ||
      er instanceof InvalidParamsError
    ) {
      return res
        .status(er.statusCode)
        .json({ success: false, errorType: er.name, message: er.message });
    }
    console.log(er);
    return res;
  }
});

export default router;
