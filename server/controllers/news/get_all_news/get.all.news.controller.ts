import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import prisma from "../../../lib/prisma.client";
import { LIKE_FIELDS, LONG_AUTHOR_FIELDS } from "../../../utils";
import { Prisma } from "@prisma/client";

export const getAllNews = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const posts = await prisma.news.findMany({
    include: {
      author: {
        select: LONG_AUTHOR_FIELDS,
      },
      likes: {
        include: {
          user: {
            select: LIKE_FIELDS,
          },
        },
      },
      bookmarks: true,
      comments: true,
    },
    orderBy: {
      createdAt: Prisma.SortOrder.desc,
    },
  });

  res.status(200).json({
    status: "success",
    posts,
  });
});
