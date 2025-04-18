const jwt = require('jsonwebtoken');
const EMP = require('../models/emp');

const LoginAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwtoken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const rootUser = await EMP.findOne({ email: decodedToken.email });

    if (!rootUser) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    req.token = token;
    req.rootUser = rootUser;
    req.userID = rootUser._id;
    req.userType = rootUser.type;

    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = { LoginAuth, verifyAdmin };
