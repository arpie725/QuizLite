import jwt from 'jsonwebtoken';

/*
  job of middleware is to intercept network requests to validate tokens
    - scenario: the client wants the users' flashcards
      - middleware intercepts this request, and checks if the token is valid
        - if token is not valid, respond back to the request directly (immediately)
        - if token is valid, add the userId to the request and pass it to the endpoint using next()
          - the server will get the request and have access to the userId where it can then modify, read, return data
  great for security where we ensure the data is being accessed by the correct users
*/

function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token was not found',
    });
  }
  // check if the token is valid using jwt
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    // modify the request to include a userId
    req.userId = decoded.id;
    // continue to the endpoint
    next();
  });
}

export default authMiddleware;
