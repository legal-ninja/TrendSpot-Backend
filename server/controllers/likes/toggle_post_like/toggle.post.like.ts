import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AppError } from "../../../helpers/global.error";
import prisma from "../../../lib/prisma.client";
import { Like } from "@prisma/client";
import { AuthenticatedRequest } from "../../../models/types/auth";
import sendPushNotification from "../../../services/push.notification";

export const togglePostLike = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const { newsId } = req.params;

  if (!newsId)
    return next(new AppError("Please provide the id of the news", 400));

  const newsToLike = await prisma.news.findFirst({
    where: {
      id: newsId,
    },
    include: {
      likes: true,
      author: true,
    },
  });

  if (!newsToLike) return next(new AppError("Post could not be found", 400));

  const userHasLikedNews = newsToLike?.likes?.find(
    (like: Like) => like.userId === req.user?.id
  );

  if (userHasLikedNews) {
    await prisma.like.deleteMany({
      where: {
        userId: req.user?.id!,
        newsId,
      },
    });
    await prisma.activity.create({
      data: {
        description: "removed your like from a news",
        category: "news",
        action: "removed like",
        userId: req.user?.id!,
        newsId: newsToLike.id!,
      },
    });
  } else {
    await prisma.like.create({
      data: {
        type: "news",
        userId: req.user?.id!,
        newsId,
      },
    });

    await prisma.activity.create({
      data: {
        description: "added a like to a news",
        category: "news",
        action: "added like",
        userId: req.user?.id!,
        newsId: newsToLike.id!,
      },
    });

    if (newsToLike.authorId !== req.user?.id) {
      await sendPushNotification({
        token: newsToLike.author.pushToken!,
        title: "+1 like",
        body: `Hey ${newsToLike.author?.firstName} ${newsToLike.author.lastName}, ${req.user?.firstName} ${req.user?.lastName} just liked a news you added`,
        data: {
          newsId: newsToLike.id,
          slug: newsToLike.slug,
          url: `trendspot://news/${newsToLike.slug}/${newsToLike.id}`,
        },
      });

      await prisma.notification.create({
        data: {
          description: `${req.user?.firstName} ${req.user?.lastName} just liked a news you added`,
          category: "news",
          userId: newsToLike.authorId,
          newsId: newsToLike.id!,
        },
      });
    } else {
      console.log("SAME USER");
    }
  }

  res.status(200).json({
    status: "success",
    message: userHasLikedNews ? "News Unliked" : "News liked",
  });
});
