import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AppError } from "../../../helpers/global.error";
import prisma from "../../../lib/prisma.client";
import { Like } from "@prisma/client";
import { AuthenticatedRequest } from "../../../models/types/auth";

export const toggleCommentLike = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const { commentId } = req.params;

  if (!commentId)
    return next(new AppError("Please provide the id of the comment", 400));

  const commentToLike = await prisma.comment.findFirst({
    where: {
      id: commentId,
    },
    include: {
      likes: true,
    },
  });

  if (!commentToLike)
    return next(new AppError("Comment could not be found", 400));

  const userHasLikedComment = commentToLike?.likes?.find(
    (like: Like) => like.userId === req.user?.id
  );

  if (userHasLikedComment) {
    await prisma.like.deleteMany({
      where: {
        userId: req.user?.id!,
        commentId,
      },
    });
  } else {
    await prisma.like.create({
      data: {
        type: "comment",
        userId: req.user?.id!,
        commentId,
      },
    });
  }

  res.status(200).json({
    status: "success",
    message: userHasLikedComment ? "Comment Unliked" : "Comment liked",
  });
});
