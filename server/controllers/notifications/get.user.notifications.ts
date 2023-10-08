import { Response } from "express";
import handleAsync from "../../helpers/async.handler";
import { AuthenticatedRequest } from "../../models/types/auth";
import prisma from "../../lib/prisma.client";
import { LONG_AUTHOR_FIELDS } from "../../utils";
import { Prisma } from "@prisma/client";

export const getUserNotifications = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response
) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId: req.query.userId as string,
    },
    include: {
      user: {
        select: { ...LONG_AUTHOR_FIELDS, news: false },
      },
      news: true,
    },
    orderBy: {
      notificationDate: Prisma.SortOrder.desc,
    },
  });

  res.status(200).json({
    status: "success",
    notifications,
  });
});
