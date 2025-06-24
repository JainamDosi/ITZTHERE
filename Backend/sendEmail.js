import nodemailer from "nodemailer";

// Create the Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dosijainam87@gmail.com", // your Gmail address
    pass: "jpfakjgwivymqbwn", // 16-char app password
  },
});

// Send email
async function sendEmail() {
  try {
    const info = await transporter.sendMail({
      from: '"JD" <dosijainam87@gmail.com>', // Sender
      to: "aiuserxyz@gmail.com", // Receiver
      subject: "Hello from Gmail + Nodemailer", // Subject
      text: "Hello world!", // Plain text body
      html: "<b>Hello world!</b>", // HTML body
    });

    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

sendEmail();
