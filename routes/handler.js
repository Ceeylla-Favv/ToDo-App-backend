const express = require('express');
const { loginUser, registerUser, forgetPassword, resetPassword, changePassword } = require('../controllers/authController');
const isLoggedIn = require('../middleware/authenticate');


const app = express();

app.use(express.json());

const router = express.Router();

router.use("/", require("./todoRoutes"));


router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/forgotPassword').post(forgetPassword);
// router.route('/verifyOTP').post(verifyOtp);
router.route('/resetPassword').post([isLoggedIn], resetPassword);
router.route('/changePassword').post(changePassword);



module.exports = router;