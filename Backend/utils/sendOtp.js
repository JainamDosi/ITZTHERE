import nodemailer from "nodemailer";

// Create the Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "noreply.itzthere@gmail.com", // your Gmail address
    pass: "nunqmutjaeagfwaj", // 16-char app password
  },
});

export const sendOtpEmail = async (to, otp, purpose) => {
  try {
    const info = await transporter.sendMail({
      from: '"ITZTHERE" <noreply.itzthere@gmail.com>', // Sender
      to, // Receiver
      subject: `${purpose === "register" ? "Email Verification" : "Login"} OTP`,
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    });

    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw error;
  }
};
