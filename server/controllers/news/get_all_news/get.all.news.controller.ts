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
  const news = await prisma.news.findMany({
    include: {
      author: {
        select: { ...LONG_AUTHOR_FIELDS, news: false },
      },
      likes: {
        include: {
          user: {
            select: { ...LIKE_FIELDS, news: false },
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
    news,
  });
});
