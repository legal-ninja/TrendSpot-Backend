import { NextFunction, Response } from "express";
import handleAsync from "../../helpers/async.handler";
import { AuthenticatedRequest } from "../../models/types/auth";
import prisma from "../../lib/prisma.client";
import { LONG_AUTHOR_FIELDS } from "../../utils";
import { Prisma } from "@prisma/client";
import { AppError } from "../../helpers/global.error";

export const markAsread = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const { type } = req.query;
  if (!req.params.id)
    return next(new AppError("Please specify Notification Id", 400));

  if (type === "All") {
    await prisma.notification.updateMany({
      data: {
        isRead: true,
      },
    });
  } else {
    await prisma.notification.update({
      where: {
        id: req.params.id as string,
      },
      data: {
        isRead: true,
      },
    });
  }

  res.status(200).json({
    status: "success",
    message:
      type === "All"
        ? "All Notification marked as read."
        : "Notification marked as read.",
  });
});
