const bcrypt = require("bcryptjs");

const generateDeliveryOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;
const hashOtp = async (otp) => bcrypt.hash(otp, 10);
const verifyOtp = async (otp, hash) => bcrypt.compare(otp, hash);

module.exports = { generateDeliveryOtp, hashOtp, verifyOtp };
