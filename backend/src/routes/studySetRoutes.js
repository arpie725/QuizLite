import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

/*
  creates a new study set
    - note that middleware has authenticated the token, and req.userId is accessible
    - ensures the user is not adding an already created study set
    - adds a new set entry into the database
    - creates a default flashcard for new study sets
    - returns the newly created study set with the default card inside it
*/
router.post('/create', async (req, res) => {
  const { title, isPublic } = req.body;
  const userId = req.userId;
  console.log(
    `Creating a new study set with title: ${title}, isPublic: ${isPublic}, userId: ${userId}`
  );
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
        isPublic: !!isPublic,
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
      message: 'Successfully created a new study set',
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



export default router;
