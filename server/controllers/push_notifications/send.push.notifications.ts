import { NextFunction, Request, Response } from "express";
import handleAsync from "../../helpers/async.handler";
import sendPushNotification from "../../services/push.notification";
import prisma from "../../lib/prisma.client";
import { AppError } from "../../helpers/global.error";

export const sendOutPushNotification = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { title, message, users, notificationType } = req.body;

  type UserPayload = {
    firstName: string;
    lastName: string;
    pushToken: string;
    avatar: string;
  };
  console.log({ users, notificationType });

  if (!message || !title)
    return next(new AppError("Both Title and Message are required", 400));

  if (notificationType === "Specific") {
    users.map(async (user: UserPayload) => {
      await sendPushNotification({
        token: user.pushToken,
        title,
        body: `Hey ${user.firstName} ${user.lastName}, ${message}`,
      });
    });
  } else {
    const allUsers = await prisma.user.findMany();
    const usersWithPushToken = allUsers.filter(
      (user) => user.pushToken !== null
    );

    usersWithPushToken.map(async (user) => {
      await sendPushNotification({
        token: user.pushToken!,
        title,
        body: `Hey ${user?.firstName} ${user.lastName}, ${message}`,
        data: {
          url: "trendspot://Notifications",
        },
      });
    });
  }

  res.status(200).json({
    status: "success",
    message:
      notificationType === "Specific" && users.length === 1
        ? "Push Notification sent successfully"
        : "Push Notifications sent successfully",
  });
});
