import { NextFunction, Response } from "express";
import handleAsync from "../../helpers/async.handler";
import { AuthenticatedRequest } from "../../models/types/auth";
import { AppError } from "../../helpers/global.error";
import { becomeAuthorEmail } from "../../views/become.author.email";
import sendEmail from "../../services/email.service";
import prisma from "../../lib/prisma.client";

export const becomeAnAuthor = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const userIsAdmin = req.user?.isAdmin;

  if (userIsAdmin)
    return next(new AppError("Admins cannot request to become an author", 403));

  const adminEmails = [process.env.ADMIN_EMAIL_ONE as string];

  const previousRequests = await prisma.authorRequest.findMany({
    where: {
      userId: req.user?.id,
    },
  });

  const unansweredRequests = previousRequests.filter(
    (request) => request.actionTaken === false
  );

  if (unansweredRequests.length > 0)
    return next(
      new AppError(
        "You have raised a request that has not been responded to yet, Please wait till you get a response.",
        403
      )
    );

  await prisma.authorRequest.create({
    data: {
      userId: req.user?.id!,
      firstName: req.user?.firstName!,
      lastName: req.user?.lastName!,
      email: req.user?.email!,
      avatar: req.user?.avatar!,
    },
  });

  const subject = "Become An Author Request";
  const SENT_FROM = process.env.EMAIL_USER as string;
  const REPLY_TO = process.env.REPLY_TO as string;
  const body = becomeAuthorEmail({
    firstName: req.user?.firstName!,
    lastName: req.user?.lastName!,
    url: "https://trend-spot-admin.vercel.app/notifications",
  });

  adminEmails.map((email) => {
    try {
      sendEmail({ subject, body, send_to: email, SENT_FROM, REPLY_TO });
      res.status(200).json({
        status: "success",
        message: `Your request to become an author has been sent to the Admins. We would get back to you when the Admins respond to your request.`,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Something went wrong. Please try again.`,
      });
    }
  });
});
