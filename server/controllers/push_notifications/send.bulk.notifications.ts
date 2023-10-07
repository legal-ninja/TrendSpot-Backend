import { NextFunction, Request, Response } from "express";
import handleAsync from "../../helpers/async.handler";
import sendPushNotification from "../../services/push.notification";
import prisma from "../../lib/prisma.client";
import { AppError } from "../../helpers/global.error";

export const sendBulkPushNotification = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { title, message } = req.body;

  if (!message || !title)
    return next(new AppError("Both Title and Message are required", 400));

  const allUsers = await prisma.user.findMany();
  const usersWithPushToken = allUsers.filter((user) => user.pushToken !== null);

  usersWithPushToken.map(async (user) => {
    await sendPushNotification({
      token: user.pushToken!,
      title,
      body: `Hey ${user?.firstName} ${user.lastName}, ${message}`,
      sound: "default",
    });
  });

  res.status(200).json({
    status: "success",
    message: "Notifications sent successfully",
  });
});
