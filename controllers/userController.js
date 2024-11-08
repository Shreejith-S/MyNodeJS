const User = require('../models/User');
const crypto = require('crypto');

// Generate OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Signup route handler
exports.signup = async (req, res) => {
  const { email, password } = req.body;
  const otp = generateOtp();
  const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  const user = new User({ email, password, otp, otpExpires });
  await user.save();
  
  res.status(200).json({ message: 'OTP sent to your email.', otp });
};

// Verify OTP route handler
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });

  if (!user) return res.status(400).json({ message: 'Invalid or expired OTP.' });

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  res.status(200).json({ message: 'OTP verified successfully.' });
};

// Resend OTP handler
exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found.' });

  user.otp = generateOtp();
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  res.status(200).json({ message: 'OTP resent.', otp: user.otp });
};

// Login route handler
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password, isVerified: true });

  if (!user) return res.status(401).json({ message: 'Invalid credentials or unverified account.' });

  res.status(200).json({ message: 'Login successful.' });
};