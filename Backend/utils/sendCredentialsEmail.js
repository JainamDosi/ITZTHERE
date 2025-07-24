import nodemailer from "nodemailer";

// Gmail transporter setup (same as your OTP transporter)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "noreply.itzthere@gmail.com",
    pass: "nunqmutjaeagfwaj", // Your 16-character app password
  },
});

/**
 * Send login credentials to a new client or employee
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} email - Login email
 * @param {string} password - Login password
 * @param {string} role - Role: 'client' or 'employee'
 */
export const sendCredentialsEmail = async (to, name, email, password, role) => {
  try {
    const subject = `${role === "client" ? "Client" : "Employee"} Login Credentials`;

    const html = `
      <p>Hello ${name},</p>
      <p>You have been added to our system as a <strong>${role}</strong>.</p>
      <p>Here are your login credentials:</p>
      <ul>
        <li><strong>Login Email:</strong> ${email}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Please login at <a href="http://localhost:5173/login">http://localhost:5173/login</a></p>
      <br/>
      <p>Regards,<br/>Team JD</p>
    `;

    const info = await transporter.sendMail({
      from: '"ITZTHERE" <noreply.itzthere@gmail.com>',
      to,
      subject,
      html,
    });

    console.log("Login credentials sent: %s", info.messageId);
  } catch (error) {
    console.error("Failed to send credentials email:", error);
    throw error;
  }
};
