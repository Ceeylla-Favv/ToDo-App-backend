// const crypto = require("crypto");
// const CryptoJS = require("crypto-js");
const bcrypt = require('bcrypt');

const userModel = require("../model/User");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const mailsender = require("../service/mailService");

const registerUser = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  try {
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    if (password !== confirmPassword)
      return res.status(400).json({ error: "Password do not match!" });

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(401).json({ error: "user already exist" });
    }

    //To hash and salt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);   


    // //Creates a unique salt for specific user
    // const salt = crypto.randomBytes(16).toString(`hex`);

    // //Hash the password with the salt
    // const hashedPassword = crypto
    //   .pbkdf2Sync(password, salt, 10000, 64, `sha512`)
    //   .toString(`hex`);




    //get new User
    const newUser = new userModel({
      username: username,
      email: email,
      password: hashedPassword,
      // salt, //saves the salt if needed for later for password comparison
    });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.jwt_secret, {
      expiresIn: "1h",
    });
    const emailBody = `Dear ${username}, you've successfully signed up `;
    await mailsender(email, "signUp successful", emailBody);


      res
        .status(201)
        .json({ message: "registered successfully", newUser });
    //send message to user after successful registration
      } catch (error) {
    console.log(error);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required!" });
  }
  try {
    const existingUser = await userModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ error: "user not found" });
    }

    const passmatch = await bcrypt.compare(password, existingUser.password);

     if (!passmatch) {
       return res.status(401).json({ error: "invalid password" });
     }

     const token = jwt.sign(
       { userId: existingUser._id },
       process.env.jwt_secret,
       { expiresIn: "1h" }
     );

     res.status(201).json({ message: " login successfully", token });
  } catch (error) {}
};


module.exports = {registerUser, loginUser};
