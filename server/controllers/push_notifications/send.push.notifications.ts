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
  const { title, message, firstName, lastName, pushToken, notificationType } =
    req.body;

  console.log({ pushToken, notificationType });

  if (!message || !title)
    return next(new AppError("Both Title and Message are required", 400));

  if (notificationType === "Single") {
    await sendPushNotification({
      token: pushToken,
      title,
      body: `Hey ${firstName} ${lastName}, ${message}`,
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
      });
    });
  }

  res.status(200).json({
    status: "success",
    message:
      notificationType === "Single"
        ? `Push Notification sent to ${firstName} ${lastName}`
        : "Push Notifications sent successfully",
  });
});
