import { NextFunction, Response } from "express";
import handleAsync from "../../helpers/async.handler";
import { AuthenticatedRequest } from "../../models/types/auth";
import prisma from "../../lib/prisma.client";
import { AppError } from "../../helpers/global.error";

export const deleteNotification = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const notification = await prisma.notification.findFirst({
    where: {
      id: req.params.notifId as string,
    },
  });

  if (!notification)
    return next(new AppError("Notification no longer exists", 404));
  await prisma.notification.delete({
    where: {
      id: req.params.notifId as string,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Notification deleted successfully.",
  });
});
