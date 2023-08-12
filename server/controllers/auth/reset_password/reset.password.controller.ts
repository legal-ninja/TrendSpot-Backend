import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AppError } from "../../../helpers/global.error";
import { createHash } from "crypto";
import prisma from "../../../lib/prisma.client";
import { User } from "../../../models/types/user";
import { genSaltSync, hashSync } from "bcryptjs";
import parser from "ua-parser-js";

export const resetPassword = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { newPassword, confirmNewPassword } = req.body;
  const { token } = req.params;

  if (!newPassword || !confirmNewPassword)
    return next(new AppError("Please provide all password credentials", 400));

  if (newPassword !== confirmNewPassword)
    return next(new AppError("New password credentials do not match", 400));

  const decryptedToken = createHash("sha256").update(token).digest("hex");

  const existingToken = await prisma.token.findFirst({
    where: {
      token: decryptedToken,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!existingToken)
    return next(new AppError("Invalid or expired token", 400));

  const user: User | null = await prisma.user.findFirst({
    where: { id: existingToken?.userId },
  });

  if (user?.isDeactivated) {
    let errorMessage;
    user.isDeactivatedByAdmin
      ? (errorMessage =
          "Your account has been deactivated by the admin. Please file an appeal through our contact channels")
      : (errorMessage =
          "Your account is currently deactivated, reactivate your account to continue");
    return next(new AppError(errorMessage, 400));
  }

  const salt = genSaltSync(10);
  const passwordHash = hashSync(newPassword, salt);

  await prisma.user.update({
    where: {
      id: user?.id,
    },
    data: {
      password: passwordHash,
    },
  });

  await prisma.token.delete({
    where: {
      id: existingToken?.id,
    },
  });

  const userAgent = parser(req.headers["user-agent"]);

  const browser: string = userAgent.browser.name || "Not detected";
  const OS: string = `${userAgent.os.name || "Not detected"} (${
    userAgent.os.version || "Not detected"
  })`;

  const subject = `${user?.firstName}, Your password was successfully reset`;
  const send_to = user?.email!;
  const sent_from = process.env.EMAIL_USER as string;
  const reply_to = process.env.REPLY_TO as string;
  // const body = resetSuccess({
  //   username: user?.lastName,
  //   browser,
  //   OS,
  // });

  try {
    // sendEmail({ subject, body, send_to, sent_from, reply_to });
    res.status(200).json({
      status: "success",
      message: `Password reset successful!`,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: `Email not sent. Please try again.`,
    });
  }
});
