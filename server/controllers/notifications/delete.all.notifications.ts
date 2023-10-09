import { Response } from "express";
import handleAsync from "../../helpers/async.handler";
import { AuthenticatedRequest } from "../../models/types/auth";
import prisma from "../../lib/prisma.client";

export const deleteAllNotifications = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response
) {
  await prisma.notification.deleteMany({
    where: {
      id: req.user?.id as string,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Notifications cleared.",
  });
});
