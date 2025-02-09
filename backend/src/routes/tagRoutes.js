import express from 'express';
import prisma from '../prismaClient.js';
import { DuplicateEntryError, InvalidParamsError } from '../utils/errors.js';

const router = express.Router();

/** creates a new tag
 *  - ensure that the tag is not empty, and that it is unique
 *  - add the tag to the database
 *  - return the newly created tag
 */
router.post('/', async (req, res) => {
  const { name } = req.body;
  const trimmedName = name?.trim();
  // interact with the database
  try {
    // check for empty name
    if (!trimmedName) {
      throw new InvalidParamsError('Tag name cannot be empty');
    }
    // check if the tag already exists
    const tagExists = await prisma.tag.findUnique({
      where: {
        name: trimmedName,
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
      },
    });
    // return the newly created tag
    return res.status(201).json({
      success: true,
      message: 'Created a new tag',
      data: {
        tag: newTag,
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

export default router;
