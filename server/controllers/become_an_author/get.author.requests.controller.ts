import { Response } from "express";
import handleAsync from "../../helpers/async.handler";
import { AuthenticatedRequest } from "../../models/types/auth";
import prisma from "../../lib/prisma.client";
import { Prisma } from "@prisma/client";
import { AUTHOR_FIELDS } from "../../utils";

export const getAuthourRequests = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response
) {
  const authorRequests = await prisma.authorRequest.findMany({
    include: {
      user: {
        select: AUTHOR_FIELDS,
      },
    },
    orderBy: {
      createdAt: Prisma.SortOrder.desc,
    },
  });

  res.status(200).json({
    status: "success",
    requests: authorRequests,
  });
});
