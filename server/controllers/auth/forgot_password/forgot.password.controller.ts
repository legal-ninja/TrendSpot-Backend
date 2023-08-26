import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AppError } from "../../../helpers/global.error";
import prisma from "../../../lib/prisma.client";
import { User } from "../../../models/types/user";
import { createHash, randomBytes } from "crypto";
import { passwordResetEmail } from "../../../views/reset.email";
import sendEmail from "../../../services/email.service";

export const forgotPassword = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email } = req.body;
  if (!email)
    return next(
      new AppError("Please provide the email associated with your account", 400)
    );

  const user: User | null = await prisma.user.findFirst({ where: { email } });
  if (!user)
    return next(new AppError("The email provided is not registered", 404));

  const resetToken = randomBytes(32).toString("hex") + user.id;
  const hashedToken = createHash("sha256").update(resetToken).digest("hex");

  await prisma.token.create({
    data: {
      token: hashedToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;

  const subject = "Password Reset Request";
  const send_to = email;
  const sent_from = process.env.EMAIL_USER as string;
  const reply_to = process.env.REPLY_TO as string;
  const body = passwordResetEmail({
    username: user.firstName,
    url: resetUrl,
  });

  try {
    sendEmail({ subject, body, send_to, sent_from, reply_to });
    res.status(200).json({
      status: "success",
      token: resetToken,
      message: `An email has been sent to ${email} with instructions
        to reset your password. Please ensure to check your spam folder, Click on 'Report as not spam' so you can keep getting our emails in your inbox`,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: `Email not sent. Please try again.`,
    });
  }
});
