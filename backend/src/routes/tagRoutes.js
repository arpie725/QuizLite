import express from 'express';
import prisma from '../prismaClient.js';
import {
  DuplicateEntryError,
  InvalidParamsError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors.js';

const router = express.Router();

// NOTE: authMiddleware authenticates the token before reaching this endpoint!

/** creates a new tag
 *  - ensures that the tag is not empty, and that it is unique to the user
 *  - adds the tag to the database
 *  - returns the newly created tag
 */
router.post('/', async (req, res) => {
  const { name } = req.body;
  const trimmedName = name?.trim();
  const userId = req.userId;
  // interact with the database
  try {
    // check for empty name
    if (!trimmedName) {
      throw new InvalidParamsError('Tag name cannot be empty');
    }
    // check if user already has existing tag
    const tagExists = await prisma.tag.findUnique({
      where: {
        userId_name: { userId, name: trimmedName },
      },
    });
    if (tagExists) {
      throw new DuplicateEntryError(
        `Tag with name '${trimmedName}' already exists`
      );
    }
    // create the tag
    const newTag = await prisma.tag.create({
      data: {
        name: trimmedName,
        userId,
      },
    });
    // remove the userId from the new tag
    const { userId: _, ...tagWithoutUserId } = newTag;
    // return the newly created tag
    return res.status(201).json({
      success: true,
      message: 'Created a new tag',
      data: {
        tag: tagWithoutUserId,
      },
    });
  } catch (er) {
    // expected error
    if (er instanceof InvalidParamsError || er instanceof DuplicateEntryError) {
      return res
        .status(er.statusCode)
        .json({ success: false, errorType: er.name, message: er.message });
    }
    // unexpected error
    console.log(er);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
});

/** edits the name of a tag
 *  - ensures that the new tag name is not empty
 *  - ensures that the old tag exists and belongs to the user
 *  - update the tag name
 *  - returns the updated tag
 */
router.put('/:tagId', async (req, res) => {
  const userId = req.userId;
  const tagId = parseInt(req.params.tagId);
  const { name } = req.body;
  const trimmedName = name?.trim();
  // interact with the database
  try {
    // check if the trimmedName is empty
    if (!trimmedName) {
      throw new InvalidParamsError('Tag name cannot be empty');
    }
    // check that a tag belonging to the user exists
    const tagExists = await prisma.tag.findUnique({
      where: {
        id: tagId,
        userId,
      },
    });
    if (!tagExists) {
      throw new NotFoundError('Tag belonging to user not found');
    }
    // make sure the new tag name doesn't already belong to the user
    const newTagExists = await prisma.tag.findUnique({
      where: {
        userId_name: { userId, name: trimmedName },
      },
    });
    if (newTagExists) {
      throw new DuplicateEntryError('Tag name already exists');
    }
    // update the tag name
    const updatedTag = await prisma.tag.update({
      where: {
        id: tagId,
      },
      data: {
        name: trimmedName,
      },
    });
    // remove the userId from the updatedTag
    const { userId: _, ...updatedTagWithoutUserId } = updatedTag;
    // return the updated tag
    return res.status(200).json({
      success: true,
      message: 'Changed the tag name',
      data: {
        updatedTagWithoutUserId,
      },
    });
  } catch (er) {
    // expected error
    if (
      er instanceof NotFoundError ||
      er instanceof DuplicateEntryError ||
      er instanceof InvalidParamsError
    ) {
      return res
        .status(er.statusCode)
        .json({ success: false, errorType: er.name, message: er.message });
    }
    console.log(er);
    // unexpected error
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
});

/** deletes a tag
 *  - ensures the tag exists and belongs to the user
 *  - deletes the tag from the database
 *  - returns a 204 no content response
 */
router.delete('/:tagId', async (req, res) => {
  const tagId = parseInt(req.params.tagId);
  const userId = req.userId;
  // interact with the database
  try {
    if (isNaN(tagId)) {
      throw new InvalidParamsError('Invalid tagId');
    }
    // ensure the tag exists and belongs to the user
    // TODO: when refactoring this, first check if the tag exists (NotFoundError)
    // TODO: then check if the tag belongs to the user (UnauthorizedError)
    const tagExists = await prisma.tag.findUnique({
      where: {
        id: tagId,
        userId,
      },
    });
    if (!tagExists) {
      throw new UnauthorizedError(
        `REFACTOR LATER: Either tag: ${tagId} doesn't exist or unauthorized access`
      );
    }
    // delete the tag from the database
    await prisma.tag.delete({
      where: {
        id: tagId,
      },
    });
    // return 204 no content
    return res.sendStatus(204);
  } catch (er) {
    // expected error
    if (
      er instanceof InvalidParamsError ||
      er instanceof NotFoundError ||
      er instanceof UnauthorizedError
    ) {
      return res
        .status(er.statusCode)
        .json({ success: false, errorType: er.name, message: er.message });
    }
    // unexpected error
    console.log(er);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
});

export default router;
