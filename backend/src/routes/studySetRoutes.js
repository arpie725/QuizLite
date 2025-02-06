import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

// NOTE: middleware authenticates the token before reaching this endpoint!

/*
  creates a new study set
    - ensures the user is not adding an already created study set
    - adds a new set entry into the database
    - creates a default flashcard for new study sets
    - returns the newly created study set with the default card inside it
*/
router.post('/', async (req, res) => {
  const { title, isPublic } = req.body;
  const userId = req.userId;
  console.log(
    `Creating a new study set with title: ${title}, isPublic: ${isPublic}, userId: ${userId}`
  );
  // check if title is empty or undefined
  if (!title) {
    console.log('Title cannot be empty');
    return res
      .status(400)
      .json({ success: false, message: 'Title cannot be empty' });
  }
  // interact with the db
  try {
    // check the set table for userId == userId and title == title
    const existingSet = await prisma.set.findFirst({
      where: {
        userId: userId,
        title: title,
      },
    });
    if (existingSet) {
      console.log(
        `Study set with with title: ${title} and userId: ${userId} already exists`
      );
      return res.status(400).json({
        success: false,
        message: `User ${userId} with study set '${title}' already exists`,
      });
    }
    // add the new study set entry into the database
    const newSet = await prisma.set.create({
      data: {
        title,
        isPublic,
        user: { connect: { id: userId } },
      },
    });
    // create a default flashcard
    const defaultCard = await prisma.card.create({
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
          ...newSet,
          cards: [{ ...defaultCard }],
        },
      },
    });
  } catch (er) {
    console.log(er);
    return res
      .status(503)
      .json({ success: false, message: 'Internal server error' });
  }
});

/*
  deletes an existing study set
    - ensures setId belongs to the user
    - deletes the study set from the sets database
    - returns success message
*/
router.delete('/:setId', async (req, res) => {
  const setId = parseInt(req.params.setId);
  const userId = req.userId;
  // interact with the database
  try {
    // find the study set with id == setId
    const curSet = await prisma.set.findUnique({
      where: {
        id: setId,
      },
    });
    if (!curSet) {
      console.log(`Study set '${setId}' does not exist`);
      return res.status(404).json({
        success: false,
        message: `Study set '${setId}' does not exist`,
      });
    }
    // ensure the set id belongs to the user
    if (curSet.userId != userId) {
      // error: study set does not belong to the current user 403
      console.log(`Study set '${setId}' does not belong to the current user`);
      return res.status(403).json({
        success: false,
        message: `Study set '${setId}' does not belong to the current user`,
      });
    }
    // delete the study set form the Set table
    await prisma.set.delete({
      where: {
        id: setId,
      },
    });
    // send back a 204 status
    return res.sendStatus(204); // 204 means no content
  } catch (er) {
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
  const userId = req.userId;
  const { title, isPublic } = req.body;
  // check if the title is empty string
  if (title === '') {
    console.log('Title cannot be empty');
    return res
      .status(400)
      .json({ success: false, message: 'Title cannot be empty' });
  }
  // interact with the database
  try {
    // check if the setId exists
    const curSet = await prisma.set.findUnique({
      where: {
        id: setId,
      },
    });
    if (!curSet) {
      console.log(`Study set '${setId}' does not exist`);
      return res.status(404).json({
        success: false,
        message: `Study set '${setId}' does not exist`,
      });
    }
    // ensure the setId belongs to the current user
    if (curSet.userId != userId) {
      // error: study set does not belong to the current user 403
      console.log(`Study set '${setId}' does not belong to the current user`);
      return res.status(403).json({
        success: false,
        message: `Study set '${setId}' does not belong to the current user`,
      });
    }
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
    // return the updated set
    return res.status(200).json({
      success: true,
      message: 'Updated the study set',
      data: updatedSet,
    });
  } catch (er) {
    console.log(er);
    return res
      .status(503)
      .json({ success: false, message: 'Internal server error' });
  }
});

export default router;
