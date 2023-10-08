import { NextFunction, Response } from "express";
import handleAsync from "../../helpers/async.handler";
import { AuthenticatedRequest } from "../../models/types/auth";
import { AppError } from "../../helpers/global.error";
import sendEmail from "../../services/email.service";
import prisma from "../../lib/prisma.client";
import { becomeAuthorAcceptedEmail } from "../../views/become.author.accepted.email";
import { becomeAuthorRejectedEmail } from "../../views/become.author.rejected.email";
import sendPushNotification from "../../services/push.notification";

export const acceptAuthorRequest = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const { response } = req.body;
  const requestWasAccepted = response === "Accepted";
  const requestToAccept = await prisma.authorRequest.findFirst({
    where: { id: req.params.requestId },
  });

  const userToUpdate = await prisma.user.findFirst({
    where: { id: req.params.userId },
  });

  if (!requestToAccept)
    return next(new AppError("Become and Author request not found.", 404));

  if (requestToAccept.isAccepted)
    return next(
      new AppError("This request has been previously accepted.", 404)
    );

  if (!userToUpdate) return next(new AppError("User not found.", 404));

  await prisma.authorRequest.update({
    where: {
      id: req.params.requestId,
    },
    data: {
      actionTaken: true,
      isAccepted: requestWasAccepted ? true : false,
    },
  });

  await prisma.user.update({
    where: {
      id: req.params.userId,
    },
    data: {
      isAuthor: requestWasAccepted ? true : false,
    },
  });

  requestWasAccepted
    ? await sendPushNotification({
        token: userToUpdate.pushToken || "",
        title: "Author Request Accepted",
        body: `Hey ${userToUpdate.firstName} ${userToUpdate.lastName}, Your request to become an author on TrendSpot has been accepted! Refresh app to see changes.`,
        data: {
          url: `trendspot://Notifications`,
        },
      })
    : await sendPushNotification({
        token: userToUpdate.pushToken || "",
        title: "Author Request Rejected",
        body: `Hey ${userToUpdate.firstName} ${userToUpdate.lastName}, Your request to become an author on TrendSpot has been rejected.`,
        data: {
          url: `trendspot://Notifications`,
        },
      });

  const subject = "An Update on your request Become An Author on TrendSpot";
  const SENT_FROM = process.env.EMAIL_USER as string;
  const REPLY_TO = process.env.REPLY_TO as string;
  const email = userToUpdate.email;
  const body = requestWasAccepted
    ? becomeAuthorAcceptedEmail(userToUpdate.firstName!, userToUpdate.lastName!)
    : becomeAuthorRejectedEmail(
        userToUpdate.firstName!,
        userToUpdate.lastName!
      );

  try {
    sendEmail({ subject, body, send_to: email, SENT_FROM, REPLY_TO });
    res.status(200).json({
      status: "success",
      message: `Your response on this request has been sent to ${userToUpdate.firstName} ${userToUpdate.lastName}.`,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: `Something went wrong. Please try again.`,
    });
  }
});
