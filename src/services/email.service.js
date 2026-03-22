require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service error:', error.message);
  } else {
    console.log('Email service is ready');
  }
});


// Base send helper
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"MoneyFlow" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};


async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to MoneyFlow";
  const text = `Hello ${name}, Welcome to MoneyFlow`;
  const html = `<h1>Hello ${name}, Welcome to MoneyFlow</h1>`;
  await sendEmail(userEmail, subject, text, html);
}


async function sendTransactionEmail({ to, name, amount, toAccount }) {
  const subject = "Transaction Completed";
  const text = `Hello ${name}, Transaction of ${amount} to ${toAccount} has been completed`;
  const html = `<h1>Hello ${name}, Transaction of ${amount} to ${toAccount} has been completed</h1>`;
  await sendEmail(to, subject, text, html);
}


async function sendFailedTransactionEmail({ to, name, amount, toAccount }) {
  const subject = "Transaction Failed";
  const text = `Hello ${name}, Transaction of ${amount} to ${toAccount} has failed`;
  const html = `<h1>Hello ${name}, Transaction of ${amount} to ${toAccount} has failed</h1>`;
  await sendEmail(to, subject, text, html);
}


async function sendReceivedMoneyEmail({ to, name, amount, fromAccount }) {
  const subject = "Money Received";
  const text = `Hello ${name}, You have received ${amount} from ${fromAccount}`;
  const html = `<h1>Hello ${name}, You have received ${amount} from ${fromAccount}</h1>`;
  await sendEmail(to, subject, text, html);
}

module.exports = { sendRegistrationEmail, sendTransactionEmail, sendFailedTransactionEmail, sendReceivedMoneyEmail }; 