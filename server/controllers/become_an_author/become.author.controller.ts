import { NextFunction, Response } from "express";
import handleAsync from "../../helpers/async.handler";
import { AuthenticatedRequest } from "../../models/types/auth";
import { AppError } from "../../helpers/global.error";
import { becomeAuthorEmail } from "../../views/become.author.email";
import sendEmail from "../../services/email.service";
import prisma from "../../lib/prisma.client";
import sendPushNotification from "../../services/push.notification";

export const becomeAnAuthor = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const userIsAdmin = req.user?.isAdmin;

  if (userIsAdmin)
    return next(new AppError("Admins cannot request to become an author", 403));

  if (req.user?.isAuthor)
    return next(new AppError("You are already an author", 403));

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
    },
  });

  await prisma.notification.create({
    data: {
      description:
        "Your request to Become An Author on TrendSpot has been sent to the admins.",
      category: "author",
      userId: req.user?.id!,
    },
  });

  await sendPushNotification({
    token: req.user?.pushToken || "",
    title: "Author Request Accepted",
    body: `Hey ${req.user?.firstName} ${req.user?.lastName}, Your request to Become An Author on TrendSpot has been sent to the admins.`,
    data: {
      url: `trendspot://Notifications`,
    },
  });

  await prisma.activity.create({
    data: {
      description: "requested to become an author",
      category: "account",
      action: "become author",
      userId: req.user?.id!,
    },
  });

  const adminEmails = [
    process.env.ADMIN_EMAIL_ONE as string,
    process.env.ADMIN_EMAIL_TWO as string,
  ];

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
