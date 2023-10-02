import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AppError } from "../../../helpers/global.error";
import { AuthenticatedRequest } from "../../../models/types/auth";
import prisma from "../../../lib/prisma.client";
import sendPushNotification from "../../../services/push.notification";

export const reActivateUser = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const { userId, token } = req.body;
  if (!userId) return next(new AppError("Please specify the user id", 404));

  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!existingUser) return next(new AppError("User could not be found", 404));

  // if (
  //   existingUser.isDeactivatedByAdmin &&
  //   req.user?.email !== "trendspot@admin.com"
  // )
  //   return next(
  //     new AppError(
  //       "Your account was deactivated by the admin. Please file an appeal to get your account reactivated",
  //       401
  //     )
  //   );

  await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      isDeactivated: false,
      isDeactivatedByAdmin: false,
    },
  });

  await prisma.activity.create({
    data: {
      description: "reactivated your account",
      category: "account",
      action: "reactivate account",
      userId: req.user?.id!,
    },
  });

  await sendPushNotification({
    token,
    title: "Account Reactivated",
    body: `Hey ${existingUser.firstName}, Your TrendSpot account has been reactivated! You are back up and running!`,
  });

  const modifiedUser = {
    ...existingUser,
    isDeactivated: false,
    isDeactivatedByAdmin: false,
  };

  const { password, ...userInfo } = modifiedUser;

  res.status(200).json({
    status: "success",
    message: "Account reactivated",
    updatedUser: userInfo,
  });
});
