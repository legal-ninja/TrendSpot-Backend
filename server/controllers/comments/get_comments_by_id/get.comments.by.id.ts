import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AUTHOR_FIELDS } from "../../../utils";
import prisma from "../../../lib/prisma.client";
import { Prisma } from "@prisma/client";

export const getCommentByNewsID = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const comments = await prisma.comment.findMany({
    where: {
      newsId: req.params.newsId as string,
    },
    include: {
      author: {
        select: AUTHOR_FIELDS,
      },
      children: {
        include: {
          author: {
            select: AUTHOR_FIELDS,
          },
        },
      },
    },
    orderBy: {
      createdAt: Prisma.SortOrder.desc,
    },
  });

  res.status(200).json({
    status: "success",
    results: comments.length,
    comments,
  });
});
