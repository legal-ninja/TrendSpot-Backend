import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AppError } from "../../../helpers/global.error";
import { AuthenticatedRequest } from "../../../models/types/auth";
import prisma from "../../../lib/prisma.client";
import sendPushNotification from "../../../services/push.notification";

export const deActivateUser = handleAsync(async function (
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
  const isDeactivatedByAdmin = req.user?.isSuperAdmin ? true : false;

  await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      isDeactivated: true,
      isDeactivatedByAdmin,
    },
  });

  await prisma.activity.create({
    data: {
      description: "deactivated your account",
      category: "account",
      action: "deactivate account",
      userId: req.user?.id!,
    },
  });

  await sendPushNotification({
    token: token || existingUser.pushToken,
    title: "Account Deactivated",
    body: !token
      ? `Hey ${existingUser.firstName} ${existingUser.lastName}, Your TrendSpot account has been deactivated by the admin. File an appeal if you think it should not be so.`
      : `Hey ${existingUser.firstName} ${existingUser.lastName}, Your TrendSpot account has been deactivated. You can always change this setting later.`,
    data: {
      url: `trendspot://AccountInfo`,
    },
  });

  const modifiedUser = {
    ...existingUser,
    isDeactivated: true,
    isDeactivatedByAdmin,
  };

  const { password, ...userInfo } = modifiedUser;

  res.status(200).json({
    status: "success",
    message: "Account deactivated",
    updatedUser: userInfo,
  });
});
