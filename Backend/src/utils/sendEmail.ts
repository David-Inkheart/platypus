"use strict";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail({ to, subject, html} : { to: string, subject: string, html: string }) {

  // Generate test SMTP service account from ethereal.email
  // Only needed if there's no real email account for testing
  // let testAccount = await nodemailer.createTestAccount();
  // console.log('testAccount: ', testAccount);

  let transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.ETHEREAL_USER, // generated test ethereal user
    pass: process.env.ETHEREAL_PASSWORD, // generated test ethereal password
  }
});
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to,
    subject, // Subject line
    html, // html body
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

}
