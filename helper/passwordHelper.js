const otpGenerator = require("otp-generator");

const generateOtp = () => {
  // Generate a 6-digit OTP
  const otpValue = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });

  // Set expiry time to 10 minutes from now
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + 10);

  return { value: otpValue, expiry: expiryTime };
};

module.exports = generateOtp;
