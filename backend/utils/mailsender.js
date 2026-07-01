const nodemailer = require('nodemailer');

const mailSender = async (email, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"IdeaHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: htmlContent,
  });
};

module.exports = mailSender;
