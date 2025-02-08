import jwt from 'jsonwebtoken';
import { NotFoundError } from '../utils/errors.js';
import { userExists } from '../utils/authHelpers.js';

/*
  job of middleware is to intercept network requests to validate tokens
    - scenario: the client wants the users' flashcards
      - middleware intercepts this request, and checks if the token is valid
        - if token is not valid, respond back to the request directly (immediately)
        - if token is valid, add the userId to the request and pass it to the endpoint using next()
          - the server will get the request and have access to the userId where it can then modify, read, return data
  great for security where we ensure the data is being accessed by the correct users
*/

async function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({
      success: false,
      errorType: 'NotFoundError',
      message: 'Token was not found',
    });
  }
  // check if the token is valid using jwt
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        errorType: 'UnauthorizedError',
        message: 'Invalid token',
      });
    }
    const userId = decoded.id;
    try {
      // check if the user exists in the database
      const existingUser = await userExists(userId);
      if (!existingUser) {
        throw new NotFoundError('User not found');
      }
      // modify the request to include a userId
      req.userId = userId;
      // continue to the endpoint
      next();
    } catch (er) {
      if (er instanceof NotFoundError) {
        return res
          .status(er.statusCode)
          .json({ success: false, message: er.message });
      }
      console.log(er);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  });
}

export default authMiddleware;
