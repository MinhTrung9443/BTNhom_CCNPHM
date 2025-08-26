import nodemailer from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';
import { InternalServerError } from './AppError.js';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendOTP = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    auth: {
      user: config.email.username,
      pass: config.email.password,
    },
  });

  // 2) Render HTML based on a pug template
  const html = pug.renderFile(
    path.join(__dirname, `../views/emails/${options.template}.pug`),
    {
      firstName: options.firstName,
      subject: options.subject,
        otp: options.otp,
    }
  );

  // 3) Define the email options
  const mailOptions = {
    from: 'Your App Name <no-reply@yourapp.com>',
    to: options.email,
    subject: options.subject,
    html,
    text: htmlToText(html),
  };

  // 4) Actually send the email
  try {
    await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully!');
  } catch (error) {
    logger.error('Error sending email: ', error);
    throw new InternalServerError('There was an error sending the email. Try again later!');
  }
};

export default sendOTP;
