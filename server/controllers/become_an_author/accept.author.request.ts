import { NextFunction, Response } from "express";
import handleAsync from "../../helpers/async.handler";
import { AuthenticatedRequest } from "../../models/types/auth";
import { AppError } from "../../helpers/global.error";
import { becomeAuthorEmail } from "../../views/become.author.email";
import sendEmail from "../../services/email.service";
import prisma from "../../lib/prisma.client";
import { becomeAuthorAcceptedEmail } from "../../views/become.author.accepted.email";

export const acceptAuthorRequest = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const userToUpdate = await prisma.user.findFirst({
    where: { id: req.params.id },
  });

  if (!userToUpdate) return next(new AppError("User not found.", 404));

  await prisma.authorRequest.update({
    where: {
      id: req.params.id,
    },
    data: {
      actionTaken: true,
    },
  });

  await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: {
      isAuthor: true,
    },
  });

  const subject = "Update on your request Become An Author on TrendSpot";
  const SENT_FROM = process.env.EMAIL_USER as string;
  const REPLY_TO = process.env.REPLY_TO as string;
  const email = userToUpdate.email;
  const body = becomeAuthorAcceptedEmail(userToUpdate.firstName!);

  try {
    sendEmail({ subject, body, send_to: email, SENT_FROM, REPLY_TO });
    res.status(200).json({
      status: "success",
      message: `Your response on this request has been sent to the ${userToUpdate.firstName}.`,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: `Something went wrong. Please try again.`,
    });
  }
});
