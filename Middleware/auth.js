const jwt = require('jsonwebtoken');

const verifyToken  = (req, res, next) => {
  // Get the token from the request header
  const token = req.header('Authorization')?.split(' ')[1]; // Authorization: 'Bearer TOKEN'

  // Check if there is no token
  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    // Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token is not valid' });
  }
};
const authJwt = {
    verifyToken: verifyToken,
  };
  
module.exports = authJwt;
