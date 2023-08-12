import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AppError } from "../../../helpers/global.error";
import prisma from "../../../lib/prisma.client";
import { AuthenticatedRequest } from "../../../models/types/auth";
import { Bookmark } from "@prisma/client";

export const toggleBookmark = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const { newsId } = req.params;

  if (!newsId)
    return next(new AppError("Please provide the id of the news", 400));

  const newsToBookmark = await prisma.news.findFirst({
    where: {
      id: newsId,
    },
    include: {
      bookmarks: true,
    },
  });

  if (!newsToBookmark)
    return next(new AppError("News could not be found", 400));

  const userHasBookmarked = newsToBookmark?.bookmarks?.find(
    (bookmark: Bookmark) => bookmark.userId === req.user?.id
  );

  if (userHasBookmarked) {
    await prisma.bookmark.deleteMany({
      where: {
        userId: req.user?.id!,
        newsId,
      },
    });
  } else {
    await prisma.bookmark.create({
      data: {
        userId: req.user?.id!,
        newsId,
      },
    });
  }

  res.status(200).json({
    status: "success",
    message: userHasBookmarked
      ? "News removed from bookmarks"
      : "News added to bookmarks",
  });
});
