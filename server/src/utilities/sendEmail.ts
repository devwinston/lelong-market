import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendEmail = async (
  email: string,
  resetPassword: string
): Promise<string> => {
  const message = {
    to: email,
    from: {
      name: "Administrator @ Lelong Market",
      email: process.env.EMAIL!,
    },
    subject: "Reset Password",
    text: `Please proceed to sign in with the following reset password: ${resetPassword}`,
    html: `<p>Please proceed to sign in with the following reset password: ${resetPassword}</p>`,
  };

  try {
    await sgMail.send(message);

    return "success";
  } catch (error) {
    return "error";
  }
};
