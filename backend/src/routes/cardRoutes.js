import express from 'express';
import prisma from '../prismaClient.js';
import {
  DuplicateEntryError,
  InvalidParamsError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors.js';
import { findAndVerifySet } from '../utils/studySetHelpers.js';
import { cardExists, cardQASExists } from '../utils/cardHelpers.js';

const router = express.Router();

// NOTE: authMiddleware authenticates the token before reaching this endpoint!

/*
  creates a new card
    - new cards with the same question AND answer should be rejected
    - adds a new card entry into the database
    - returns the newly created card
*/
router.post('/:setId', async (req, res) => {
  const { question, answer } = req.body;
  const setId = parseInt(req.params.setId);
  const userId = req.userId;
  const trimmedQuestion = question?.trim();
  const trimmedAnswer = answer?.trim();
  // interact with the database
  try {
    // check that the request sent the question, answer, and setId
    if (!trimmedQuestion || !trimmedAnswer || setId === undefined) {
      throw new InvalidParamsError(
        'Cannot have empty question, answer, or undefined setId'
      );
    }
    // verify the set exists and belongs to the user
    await findAndVerifySet(setId, userId);
    // ensure the new card's question and answer is unique to the set
    if (await cardQASExists(trimmedQuestion, trimmedAnswer, setId)) {
      throw new DuplicateEntryError(
        'Card with identical question + answer already exists'
      );
    }
    // create a new card entry
    const newCard = await prisma.card.create({
      data: {
        question: trimmedQuestion,
        answer: trimmedAnswer,
        set: { connect: { id: setId } },
      },
    });
    // return the newly created card
    return res.status(201).json({
      success: true,
      message: 'Created a new flashcard',
      data: newCard,
    });
  } catch (er) {
    if (
      er instanceof InvalidParamsError ||
      er instanceof NotFoundError ||
      er instanceof DuplicateEntryError ||
      er instanceof UnauthorizedError
    ) {
      return res
        .status(er.statusCode)
        .json({ success: false, errorType: er.name, message: er.message });
    }
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
});

/*
  edits an existing card
    - ensures the card exists, belongs to the user, and belongs to the study set
    - ensures the question and answer doesn't already exist in the set
    - edits the card 
    - returns the edited card
*/
router.put('/:cardId', async (req, res) => {
  const { question, answer, isComplete } = req.body;
  const userId = req.userId;
  const cardId = parseInt(req.params.cardId);
  const trimmedQuestion = question?.trim();
  const trimmedAnswer = answer?.trim();
  // interact with the database
  try {
    // check if the question or answer is empty string
    if (trimmedQuestion === '' || trimmedAnswer === '') {
      throw new InvalidParamsError('Question or Answer cannot be empty');
    }
    // check if a card with cardId exists in the database
    const curCard = await cardExists(cardId);
    if (!curCard) {
      throw new NotFoundError(`Card with id: ${cardId} not found`);
    }
    // get the setId from the card
    const setId = curCard.setId;
    // verify the setId exists and belongs to the user
    await findAndVerifySet(setId, userId);
    // the user wants to update the question and / or answer
    if (trimmedQuestion || trimmedAnswer) {
      const updatedQuestion = trimmedQuestion ?? curCard.question;
      const updatedAnswer = trimmedAnswer ?? curCard.answer;
      // check if a card with the same question / answer already exists in the set
      if (await cardQASExists(updatedQuestion, updatedAnswer, setId)) {
        throw new DuplicateEntryError(
          'Card with identical question + answer already exists'
        );
      }
    }
    // update the card at cardId
    const updatedCard = await prisma.card.update({
      where: {
        id: cardId,
      },
      data: {
        question: trimmedQuestion,
        answer: trimmedAnswer,
        isComplete,
      },
    });
    // return the updated card
    res.status(200).json({
      success: true,
      message: 'Updated the card',
      data: {
        updatedCard,
      },
    });
  } catch (er) {
    if (
      er instanceof InvalidParamsError ||
      er instanceof UnauthorizedError ||
      er instanceof NotFoundError ||
      er instanceof DuplicateEntryError
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
  deletes an existing card
    - ensures the card exists, belongs to the user, and belongs to the study set
    - deletes the card from the database
    - returns 204 status
*/
router.delete('/:cardId', async (req, res) => {
  const cardId = parseInt(req.params.cardId);
  const userId = req.userId;
  // interact with the database
  try {
    // make sure cardId is not undefined
    if (cardId === undefined) {
      throw new InvalidParamsError('No cardId was given');
    }
    // make sure the card exists
    const curCard = await cardExists(cardId);
    if (!curCard) {
      throw new NotFoundError(`Card with id: ${cardId} not found`);
    }
    // validate the study set belongs to the user
    await findAndVerifySet(curCard.setId, userId);
    // delete the card from the database
    await prisma.card.delete({
      where: {
        id: cardId,
      },
    });
    return res.sendStatus(204); // 204 means no content
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
      .json({ success: false, message: 'Internal service error' });
  }
});

export default router;
