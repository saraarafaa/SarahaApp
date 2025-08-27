import nodemailer from "nodemailer";

export const sendEmail = async({to, subject, html, attachments}) =>{
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

  const info = await transporter.sendMail({
    from: `"Confirm your email" <${process.env.EMAIL}>`,
    to: to || "saraarafa177@gmail.com",
    subject: subject || "Hello ✔",
    html: html || "<b>Hello world?</b>", 
    attachments: attachments || []
  });

  if(info.accepted.length > 0) {
    return true
  } return false
}



