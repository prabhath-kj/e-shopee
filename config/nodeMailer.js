import dotenv from "dotenv";
dotenv.config();
import nodeMailer from "nodemailer";

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

export const sendInvoiceByEmail = async (invoicePath, recipientEmail) => {
  try {
    // Create a nodemailer transporter
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

    // Send email with the invoice PDF attached
    await transporter.sendMail({
      from: process.env.USER, // Replace with your email address
      to: recipientEmail,
      subject: "Invoice",
      text: "Please find the attached invoice.",
      attachments: [
        {
          filename: "invoice.pdf",
          path: invoicePath,
        },
      ],
    });

    console.log("Invoice sent successfully via email!");
  } catch (error) {
    console.error("Failed to send invoice via email:", error);
  }
};
export default sendEmail;
