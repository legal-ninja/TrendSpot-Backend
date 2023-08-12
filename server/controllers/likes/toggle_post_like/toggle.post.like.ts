import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AppError } from "../../../helpers/global.error";
import prisma from "../../../lib/prisma.client";
import { Like } from "@prisma/client";
import { AuthenticatedRequest } from "../../../models/types/auth";

export const togglePostLike = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const { newsId } = req.params;

  if (!newsId)
    return next(new AppError("Please provide the id of the news", 400));

  const postToLike = await prisma.news.findFirst({
    where: {
      id: newsId,
    },
    include: {
      likes: true,
    },
  });

  if (!postToLike) return next(new AppError("Post could not be found", 400));

  const userHasLiked = postToLike?.likes?.find(
    (like: Like) => like.userId === req.user?.id
  );

  if (userHasLiked) {
    await prisma.like.deleteMany({
      where: {
        userId: req.user?.id!,
        newsId,
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
  }

  res.status(200).json({
    status: "success",
    message: userHasLiked ? "News Unliked" : "News liked",
  });
});
