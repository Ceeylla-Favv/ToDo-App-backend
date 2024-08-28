// const crypto = require("crypto");
// const CryptoJS = require("crypto-js");

// const express = require('express');
const bcrypt = require("bcrypt");

// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

const userModel = require("../model/User");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const mailsender = require("../service/mailService");
const generateOtp = require("../helper/passwordHelper");







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
      return res.status(401).json({ error: "User already exist" });
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
      username,
      email,
      password: hashedPassword,
      // salt, //saves the salt if needed for later for password comparison
    });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.jwt_secret, {
      expiresIn: "1h",
    });
    const emailBody = `Dear ${username}, you've successfully signed up `;
    await mailsender(email, "SignUp successful", emailBody);

    res.status(201).json({ message: "Registered successfully", newUser });
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

// const forgetPassword = async (req, res) => {
//   const { email } = req.body;
//      console.log("Request Body: ", req.body)
//   try {
//     // Generate OTP
//     const otp = generateOtp().value;

//     //find user 
//     // const user = await userModel.findOne({email});
//     const user = await userModel.findOne({ email });

//     if (!user) {
//         return res.status(404).json({error: "User not found"});   
//     }
//     await user.update({forgetPasswordOtp: otp});

//     //send password reset email with OTP
//     const emailBody = `Your OTP for password reset is: ${otp}`;
//     await mailsender.mailsender(email, "Password Reset OTP", emailBody);
//     res.status(200).json({message: "Password reset email sent successfully"});
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: "An error occurred while sending password reset email",
//     });
//   }

// };


const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Generate OTP
    const otp = generateOtp().value;
    const otpExpires = Date.now()+3600000

    // Find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.resetToken = otp;
    user.resetExpires = otpExpires;
    await user.save()
    
    // Send password reset email with OTP
    const emailBody = `Your OTP for password reset is: ${otp}`;
    await mailsender(email, "Password Reset OTP", emailBody);
    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Error in forgetPassword: ", error);
    res.status(500).json({
      error: "An error occurred while sending password reset email",
    });
  }
};



// const verifyOtp = async (req, res) => {
//     const {email, otp } = req.body;

//     try {
//         //find user
//         const user = await userModel.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ error: "invalid otp" });
//         } 
//         // check if otp exists and it has not expired
//         if (!user.forgetPasswordOtp || user.forgetPasswordOtp.value !== otp || user.forgetPasswordOtp.Expiry < new Date()) {
//             return res.status(400).json({ error: "Invalid or expired OTP" });
//         }
//         res.status(200).json({ message: "OTP verified successfully" });
//     } catch (error) {
//         console.error("Error verifying OTP:", error);
//         res
//           .status(500)
//           .json({ error: "An error occurred while verifying OTP" });    
//     }
// }

const resetPassword = async (req, res) => {
    const { resetToken, password, confirmPassword } = req.body;

    try {
        if (password !== confirmPassword){
          return res.status(400).json({ error: "Password do not match!" });
        }
        // find user
        const user = await userModel.findOne({ resetToken, resetExpires:{$gt: Date.now()}})
        if(!user) {
            return res.status(404).json({ error: "Invalid Token or Token has expired"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await userModel.findOneAndUpdate({resetToken}, {resetExpires:undefined, resetToken:undefined, password: hashedPassword,}, 
          {new:true, runValidators:true})

        res.status(200).json({ message: "Password change successfull"})
    } catch (error) {
        console.errpr("Error changing password:", error);
        res.status(500).json({ error: "An error occurred while changing the password"});
    }
};


const changePassword = async (req, res) => {
    const {currentPassword, newPassword } = req.body;
    try {
      
        const user = await userModel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User not found"});
        }
        
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        
        if (!isValidPassword) {
            return res.status(400).json({ error: "Invalid current password"});
        }
       
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await userModel.findByIdAndUpdate(req.user._id, { password: hashedPassword}, {new: true, runValidators: true});

        res.status(200).json({ message: "Password chnaged successfully"});
    } catch (error) {
        console.error("Error changing password", error);
        res.status(500).json({ error: "An error occurred while changing the password"});
    }
};

module.exports = { registerUser, loginUser, forgetPassword, resetPassword, changePassword };
