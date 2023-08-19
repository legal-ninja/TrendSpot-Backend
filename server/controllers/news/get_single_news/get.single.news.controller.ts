import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import prisma from "../../../lib/prisma.client";
import { AUTHOR_FIELDS, LONG_AUTHOR_FIELDS } from "../../../utils";
import { AppError } from "../../../helpers/global.error";

export const getSingleNews = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const news = await prisma.news.findFirst({
    where: {
      AND: [{ slug: req.params.slug }, { id: req.params.postId }],
    },
    include: {
      author: {
        select: LONG_AUTHOR_FIELDS,
      },
      bookmarks: {
        include: {
          user: {
            select: AUTHOR_FIELDS,
          },
        },
      },
      comments: {
        include: {
          author: {
            select: AUTHOR_FIELDS,
          },
        },
      },
      likes: {
        include: {
          user: {
            select: LONG_AUTHOR_FIELDS,
          },
        },
      },
    },
  });

  if (!news) return next(new AppError("News not found", 400));

  res.status(200).json({
    status: "success",
    news,
  });
});
