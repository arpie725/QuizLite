import prisma from '../prismaClient.js';
import {
  InvalidParamsError,
  NotFoundError,
  UnauthorizedError,
  DuplicateEntryError,
} from './errors.js';

/** verifies the tag exists and belongs to the user
 *  - ensures tagId is a valid int
 *  @params tagId (int), userId (int)
 *  @returns tag (with userId removed)
 *  @throws InvalidParamsError, NotFoundError, UnauthorizedError
 */
async function findAndVerifyTag(tagId, userId) {
  // interact with the database
  try {
    // ensure tagId is a valid int
    if (isNaN(tagId)) {
      throw new InvalidParamsError('Invalid tagId');
    }
    // check if tag exists
    const tagExists = await prisma.tag.findUnique({
      where: {
        id: tagId,
      },
    });
    if (!tagExists) {
      throw new NotFoundError('Tag not found');
    }
    // check if tag belongs to user
    const tagBelongingUser = await prisma.tag.findUnique({
      where: {
        id: tagId,
        userId,
      },
    });
    if (!tagBelongingUser) {
      throw new UnauthorizedError('Unauthorized access to tag');
    }
    // remove the userId from the tag
    const { userId: _, ...tagWithoutUserId } = tagBelongingUser;
    // return the tag
    return tagWithoutUserId;
  } catch (er) {
    throw er;
  }
}

/** verifies a unique tag
 *  - ensures the userId and name do not already exist
 *  @params userId (int), name (string)
 *  @returns None
 *  @throws InvalidParamsError, DuplicateEntryError
 */
async function verifyUniqueTag(userId, name) {
  // interact with the database
  try {
    // check for invalid name param
    if (!name) {
      throw new InvalidParamsError('Tag name cannot be empty');
    }
    // check if user already has tag with same name
    const tagExists = await prisma.tag.findUnique({
      where: {
        userId_name: { userId, name },
      },
    });
    if (tagExists) {
      throw new DuplicateEntryError(`Tag with name '${name}' already exists`);
    }
  } catch (er) {
    throw er;
  }
}

/** creates new tag entry into the database
 *  @params userId (int), name (string)
 *  @returns newly created tag (without userId)
 */
async function createNewTag(userId, name) {
  // interact with database
  try {
    // create the new tag
    const newTag = await prisma.tag.create({
      data: {
        name,
        userId,
      },
    });
    // remove the userId from the tag
    const { userId: _, ...tagWithoutUserId } = newTag;
    // return the newly created tag
    return tagWithoutUserId;
  } catch (er) {
    throw er;
  }
}

/** updates the name of a tag
 *  @params tagId (int), name (string)
 *  @returns the updated tag (without userId)
 */
async function updateTagName(tagId, name) {
  // interact with the database
  try {
    // update tag
    const updatedTag = await prisma.tag.update({
      where: {
        id: tagId,
      },
      data: {
        name,
      },
    });
    // remove the userId from the updatedTag
    const { userId: _, ...updatedTagWithoutUserId } = updatedTag;
    return updatedTagWithoutUserId;
  } catch (er) {
    throw er;
  }
}

export { findAndVerifyTag, verifyUniqueTag, createNewTag, updateTagName };
