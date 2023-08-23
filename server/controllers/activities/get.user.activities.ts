import { NextFunction, Request, Response } from "express";
import handleAsync from "../../helpers/async.handler";
import { AuthenticatedRequest } from "../../models/types/auth";
import { AppError } from "../../helpers/global.error";
import prisma from "../../lib/prisma.client";
import { LONG_AUTHOR_FIELDS } from "../../utils";

export const getUserActivities = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const activities = await prisma.activity.findMany({
    where: {
      userId: req.query.userId as string,
    },
    include: {
      user: {
        select: LONG_AUTHOR_FIELDS,
      },
    },
  });

  res.status(200).json({
    status: "success",
    activities,
  });
});
