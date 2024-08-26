const jwt = require("jsonwebtoken");
//const User = require("../model/User");
const userModel = require("../model/User");
require("dotenv").config();

const isLoggedIn = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.jwt_secret);
      req.user = await userModel.findById(decoded.userId);
      if(!req.user){
        return res.status(401).json({error: "not authorized, pls login"});
      }
    } catch (error) {
      console.log(error.message);
      return res.status(403).json({ error: "Invalid token" });
    }
  }
  if (!token) {
    return res.status(401).json({ error: "token is missing from the header" });
  }

  next();
};


module.exports = isLoggedIn;
