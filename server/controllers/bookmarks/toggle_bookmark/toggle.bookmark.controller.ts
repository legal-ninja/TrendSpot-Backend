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

    await prisma.activity.create({
      data: {
        description: "removed a news from your bookmarks",
        category: "news",
        action: "remove bookmark",
        userId: req.user?.id!,
      },
    });
  } else {
    await prisma.bookmark.create({
      data: {
        userId: req.user?.id!,
        newsId,
      },
    });

    await prisma.activity.create({
      data: {
        description: "added a news to your bookmarks",
        category: "news",
        action: "add bookmark",
        userId: req.user?.id!,
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
