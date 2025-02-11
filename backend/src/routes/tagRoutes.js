import express from 'express';
import prisma from '../prismaClient.js';
import {
  DuplicateEntryError,
  InvalidParamsError,
  NotFoundError,
  UnauthorizedError,
  handleErrors,
} from '../utils/errors.js';
import {
  createNewTag,
  findAndVerifyTag,
  updateTagName,
  verifyUniqueTag,
} from '../utils/tagHelpers.js';

const router = express.Router();

// NOTE: authMiddleware authenticates the token before reaching this endpoint!

/** creates a new tag
 *  - ensures that the tag is not empty, and that it is unique to the user
 *  - adds the tag to the database
 *  - returns the newly created tag
 */
router.post('/', async (req, res) => {
  const name = req.body.name?.trim();
  const userId = req.userId;
  // interact with the database
  try {
    // verify the tag name is unique to user
    await verifyUniqueTag(userId, name);
    // create the tag
    const newTag = await createNewTag(userId, name);
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
    // expected error
    return handleErrors(er, res);
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
  const name = req.body.name?.trim();
  // interact with the database
  try {
    // check that a tag belonging to the user exists
    await findAndVerifyTag(tagId, userId);
    // make sure the new tag name doesn't already belong to the user
    await verifyUniqueTag(userId, name);
    // update the tag name
    const updatedTag = await updateTagName(tagId, name);
    // return the updated tag
    return res.status(200).json({
      success: true,
      message: 'Changed the tag name',
      data: {
        updatedTag,
      },
    });
  } catch (er) {
    // expected error
    return handleErrors(er, res);
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
    // ensure the tag exists and belongs to the user
    await findAndVerifyTag(tagId, userId);
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
    return handleErrors(er, res);
  }
});

/** retrieves a tag
 *  - ensures the tag exists and belongs to the user
 *  - retrieve the tag from the database
 *  - return the tag
 */
router.get('/:tagId', async (req, res) => {
  const userId = req.userId;
  const tagId = parseInt(req.params.tagId);
  // interact with the database
  try {
    // check the tag exists and belongs to the user
    const tagExists = await findAndVerifyTag(tagId, userId);
    // return the tag
    return res.status(201).json({
      success: true,
      message: 'Retrieved the tag',
      data: {
        tag: tagExists,
      },
    });
  } catch (er) {
    // expected error
    return handleErrors(er, res);
  }
});

/** retrieves all sets belonging to a tag
 *  - ensures the tag exists and belongs to the user
 *  - retrieve many sets from the database
 *  - return sets
 */
router.get('/:tagId/sets', async (req, res) => {
  const userId = req.userId;
  const tagId = parseInt(req.params.tagId);
  // interact with the database
  try {
    await findAndVerifyTag(tagId, userId);
    // retrieve all the sets that have tagId
    // TODO
  } catch (er) {
    handleErrors(er, res);
  }
});

export default router;
