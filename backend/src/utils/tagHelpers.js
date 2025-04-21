import prisma from '../prismaClient.js';
import {
  InvalidParamsError,
  NotFoundError,
  UnauthorizedError,
  DuplicateEntryError,
} from './errors.js';

/** verifies the tag exists and belongs to the user
 * - ensures tagId is a valid positive int
 * @param {number} tagId
 * @param {number} userId
 * @returns tag (with userId removed)
 */
async function findAndVerifyTag(tagId, userId) {
  // interact with the database
  try {
    // ensure tagId is a valid int
    if (isNaN(tagId) || tagId < 0) {
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
      omit: {
        userId: true,
      },
    });
    if (!tagBelongingUser) {
      throw new UnauthorizedError('Unauthorized access to tag');
    }
    // return the tag
    return tagBelongingUser;
  } catch (er) {
    throw er;
  }
}

/** verifies each tagId exists and belongs to the user
 * @param {number[]} tagIds
 * @param {number} userId
 * @returns tags (with userId removed)
 */
async function findAndVerifyTags(tagIds, userId) {
  try {
    // check that tagIds is a non-empty int array
    if (!Array.isArray(tagIds) || !tagIds.every(Number.isInteger)) {
      throw new InvalidParamsError('tagIds must be a non-empty int array');
    }
    // verify each tag exists and belongs to the user
    const tags = await prisma.tag.findMany({
      where: {
        id: { in: tagIds },
        userId,
      },
      omit: { userId: true },
    });
    if (tags.length != tagIds.length) {
      throw new UnauthorizedError(
        'Not all tags provided exist or belong to user'
      );
    }
    // return the tags
    return tags;
  } catch (er) {
    throw er;
  }
}

/** verifies a unique tag
 * - ensures the userId and name do not already exist
 * @param {number} userId
 * @param {string} name
 * @returns None
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
 * @param {number} userId
 * @param {string} name
 * @returns newly created tag (without userId)
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
      omit: {
        userId: true,
      },
    });
    // return the newly created tag
    return newTag;
  } catch (er) {
    throw er;
  }
}

/** updates the name of a tag
 * @param {number} tagId
 * @param {string} name
 * @returns the updated tag (without userId)
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
      omit: {
        userId: true,
      },
    });
    return updatedTag;
  } catch (er) {
    throw er;
  }
}

export {
  findAndVerifyTag,
  findAndVerifyTags,
  verifyUniqueTag,
  createNewTag,
  updateTagName,
};
