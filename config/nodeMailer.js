require("dotenv").config();
const nodeMailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      text: text,
    });
    console.log("Email sended");
  } catch (err) {
    console.log("Email not sended");
    console.error(err);
  }
};

module.exports = sendEmail;
