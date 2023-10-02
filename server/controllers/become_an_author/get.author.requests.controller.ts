import { NextFunction, Response } from "express";
import handleAsync from "../../helpers/async.handler";
import { AuthenticatedRequest } from "../../models/types/auth";
import prisma from "../../lib/prisma.client";
import { Prisma } from "@prisma/client";

export const getAuthourRequests = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authorRequests = await prisma.authorRequest.findMany({
    orderBy: {
      createdAt: Prisma.SortOrder.desc,
    },
  });

  res.status(200).json({
    status: "success",
    requests: authorRequests,
  });
});
