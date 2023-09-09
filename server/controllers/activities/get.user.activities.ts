import { Response } from "express";
import handleAsync from "../../helpers/async.handler";
import { AuthenticatedRequest } from "../../models/types/auth";
import prisma from "../../lib/prisma.client";
import { LONG_AUTHOR_FIELDS } from "../../utils";
import { Prisma } from "@prisma/client";

export const getUserActivities = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response
) {
  const activities = await prisma.activity.findMany({
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
      activityDate: Prisma.SortOrder.desc,
    },
  });

  res.status(200).json({
    status: "success",
    activities,
  });
});
