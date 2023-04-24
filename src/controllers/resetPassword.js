import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

import { user as User } from '../../database/models';

dotenv.config();

// Define the nodemailer transporter object
const transporter = nodemailer.createTransport({
  service: process.env.RESET_EMAIL_SERVICE,
  auth: {
    user: process.env.RESET_EMAIL,
    pass: process.env.RESET_PASSWORD,
  },
});
// Send the password reset email
async function sendResetEmail(user) {
  const token = jwt.sign({ email: user.email }, process.env.USER_SECRET, {
    expiresIn: '1h',
  });

  const resetLink = `${process.env.HOST}/reset-password/${token}`;
  const mailOptions = {
    to: user.email,
    from: `ATLP E-commerce <${process.env.RESET_EMAIL}>`,
    subject: 'Your App Password Reset',
    text: `Hi ${user.name},\n\nYou are receiving this email because we received a password reset request for your account.
    \n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetLink}\n If
     you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };
  await transporter.sendMail(mailOptions);
}
function verifyResetToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.USER_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded.email);
      }
    });
  });
}
async function resetPassword(email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const foundUser = await User.findOne({ where: { email } });

  await foundUser.update({
    password: hashedPassword,
    passcodeModifiedAt: Date.now(),
  });
}
async function requestReset(req, res) {
  const { email } = req.body;
  const foundUser = await User.findOne({ where: { email } });
  if (!foundUser) {
    return res.status(404).json({
      error: 'Email not found',
    });
  }
  const token = jwt.sign({ email }, process.env.USER_SECRET, {
    expiresIn: '1h',
  });
  res.cookie('token', token, { httpOnly: true, maxAge: 3600, path: '/' });
  await foundUser.save();
  await sendResetEmail(foundUser);
  return res.status(200).json({ message: 'Password reset email sent' });
}
async function processReset(req, res) {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const email = await verifyResetToken(token);
    const foundUser = await User.findOne({ where: { email } });
    if (!foundUser) {
      return res.status(404).json({
        error: req.t('error'),
      });
    }

    await resetPassword(email, password);
    return res.status(200).json({
      ok: true,
      message: 'Password reset successfully',
    });
  } catch (err) {
    return res.status(400).json({
      error: 'Invalid token',
    });
  }
}
export { requestReset, processReset };
