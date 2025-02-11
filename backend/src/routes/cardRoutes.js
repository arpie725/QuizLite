import express from 'express';
import prisma from '../prismaClient.js';
import {
  DuplicateEntryError,
  NotFoundError,
  handleErrors,
} from '../utils/errors.js';
import { findAndVerifySet } from '../utils/studySetHelpers.js';
import {
  cardExists,
  cardQASExists,
  validateQuestionAndAnswer,
} from '../utils/cardHelpers.js';

const router = express.Router();

// NOTE: authMiddleware authenticates the token before reaching this endpoint!

/** creates a new card
 * - new cards with the same question AND answer should be rejected
 * - adds a new card entry into the database
 * - returns the newly created card
 */
router.post('/:setId', async (req, res) => {
  const { question: rawQuestion, answer: rawAnswer } = req.body;
  const setId = parseInt(req.params.setId);
  const userId = req.userId;
  // interact with the database
  try {
    // validate the question, answer
    const { question, answer } = await validateQuestionAndAnswer(
      rawQuestion,
      rawAnswer
    );
    // verify the set exists and belongs to the user
    await findAndVerifySet(setId, userId);
    // ensure the new card's question and answer is unique to the set
    if (await cardQASExists(question, answer, setId)) {
      throw new DuplicateEntryError(
        'Card with identical question + answer already exists'
      );
    }
    // create a new card entry
    const newCard = await prisma.card.create({
      data: {
        question,
        answer,
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
    // expected error
    return handleErrors(er, res);
  }
});

/** edits an existing card
 * - ensures the card exists, belongs to the user, and belongs to the study set
 * - ensures the question and answer doesn't already exist in the set
 * - edits the card
 * - returns the edited card
 */
router.put('/:cardId', async (req, res) => {
  const { question: rawQuestion, answer: rawAnswer, isComplete } = req.body;
  const userId = req.userId;
  const cardId = parseInt(req.params.cardId);
  // interact with the database
  try {
    // validate question and answer
    const { question, answer } = await validateQuestionAndAnswer(
      rawQuestion,
      rawAnswer
    );
    // check if a card with cardId exists in the database
    const curCard = await cardExists(cardId);
    if (!curCard) {
      throw new NotFoundError(`Card not found`);
    }
    // get the setId from the card
    const setId = curCard.setId;
    // verify the setId exists and belongs to the user
    await findAndVerifySet(setId, userId);
    // the user wants to update the question and / or answer
    if (question || answer) {
      const updatedQuestion = question ?? curCard.question;
      const updatedAnswer = answer ?? curCard.answer;
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
        question,
        answer,
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
    // expected error
    return handleErrors(er, res);
  }
});

/** deletes an existing card
 * - ensures the card exists, belongs to the user, and belongs to the set
 * - deletes the card from the database
 * - returns 204 no content
 */
router.delete('/:cardId', async (req, res) => {
  const cardId = parseInt(req.params.cardId);
  const userId = req.userId;
  // interact with the database
  try {
    // make sure the card exists
    const curCard = await cardExists(cardId);
    if (!curCard) {
      throw new NotFoundError(`Card not found`);
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
    // expected error
    return handleErrors(er, res);
  }
});

export default router;
