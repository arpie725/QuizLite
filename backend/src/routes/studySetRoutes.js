import express from 'express';
import prisma from '../prismaClient.js';
import { findAndVerifySet, setExists } from '../utils/studySetHelpers.js';
import {
  NotFoundError,
  UnauthorizedError,
  InternalError,
  InvalidParamsError,
  DuplicateEntryError,
  handleErrors,
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
  const userId = req.userId;
  const trimmedTitle = title?.trim();
  // interact with the db
  try {
    // check if title is empty or undefined
    if (!trimmedTitle) {
      throw new InvalidParamsError('Title cannot be empty');
    }
    // check if the set already exists
    if (await setExists(trimmedTitle, userId)) {
      throw new DuplicateEntryError(
        `Study set with with title: ${trimmedTitle} and userId: ${userId} already exists`
      );
    }
    // add the new study set entry into the database
    const newSet = await prisma.set.create({
      data: {
        title: trimmedTitle,
        isPublic,
        user: { connect: { id: userId } },
      },
      omit: {
        userId: true,
      },
    });
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
        set: newSet,
      },
    });
  } catch (er) {
    // expected error
    return handleErrors(er, res);
  }
});

/** assigns tags to a study set
 *  - ensures the set exists and belongs to the user
 *  - ensures each tag exists and belongs to the user
 *  - connect the tags to the set
 *  - returns the set with the updated tags
 */
router.post('/:setId/assign-tags', async (req, res) => {
  const userId = req.userId;
  const setId = parseInt(req.params.setId);
  const { tagIds } = req.body; // expecting an array of tagId
  // interact with the database
  try {
    // check that tagIds is an array
    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      throw new InvalidParamsError('tagIds must be a non-empty array');
    }
    // verify set exists and belongs to user
    await findAndVerifySet(setId, userId);
    // verify each tag exists and belongs to the user
    const existingTags = await prisma.tag.findMany({
      where: {
        id: { in: tagIds },
        userId,
      },
    });
    if (existingTags.length != tagIds.length) {
      throw new UnauthorizedError(
        'Not all tags provided exist or belong to user'
      );
    }
    // connect the tags to the set
    const updatedSet = await prisma.set.update({
      where: { id: setId },
      data: {
        tags: {
          connect: existingTags.map((tag) => ({ id: tag.id })),
        },
      },
      include: { tags: { omit: { userId: true } } },
      omit: {
        userId: true,
      },
    });
    // return the set with the tags
    return res.status(201).json({
      success: true,
      message: 'Connected tags to set',
      data: {
        set: updatedSet,
      },
    });
  } catch (er) {
    return handleErrors(er, res);
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
  const userId = req.userId;
  const { title, isPublic } = req.body;
  const trimmedTitle = title?.trim();
  // interact with the database
  try {
    // check if the title is empty string
    if (trimmedTitle === '') {
      throw new InvalidParamsError('Title cannot be empty');
    }
    // verify setId exists and belongs to the user
    await findAndVerifySet(setId, userId);
    // possible that title was never passed in
    if (title) {
      // verify that a set with the same title doesn't already exist
      if (await setExists(trimmedTitle, userId)) {
        throw new DuplicateEntryError(
          `Study set with with title: ${trimmedTitle} and userId: ${userId} already exists`
        );
      }
    }
    // update the title
    const updatedSet = await prisma.set.update({
      where: {
        id: setId,
      },
      data: {
        title: trimmedTitle,
        isPublic,
      },
      omit: {
        userId: true,
      },
    });
    // return the updated set
    return res.status(200).json({
      success: true,
      message: 'Updated the study set',
      data: {
        set: updatedSet,
      },
    });
  } catch (er) {
    // expected error
    return handleErrors(er, res);
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
    // expected error
    return handleErrors(er, res);
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
  const userId = req.userId;
  // interact with the database
  try {
    // verify the setId exists and belongs to the user
    const { curSet, cardCount } = await findAndVerifySet(setId, userId);
    // return the set from the database
    return res.status(201).json({
      success: true,
      message: 'Retrieved the set',
      data: {
        set: curSet,
        cardCount,
      },
    });
  } catch (er) {
    // expected error
    return handleErrors(er, res);
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
  const userId = req.userId;
  // interact with the database
  try {
    // verify study set belongs to user
    const { curSet, cardCount } = await findAndVerifySet(setId, userId);
    // query the database for all cards that have setId
    const cards = await prisma.card.findMany({
      where: {
        setId,
      },
    });
    // return the curSet and cards
    return res.status(201).json({
      success: true,
      message: 'Retrieved all cards from set',
      data: {
        set: curSet,
        cardCount,
        cards,
      },
    });
  } catch (er) {
    // expected error
    return handleErrors(er, res);
  }
});

export default router;
