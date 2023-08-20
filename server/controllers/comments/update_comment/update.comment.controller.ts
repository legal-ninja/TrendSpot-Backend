import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AppError } from "../../../helpers/global.error";
import prisma from "../../../lib/prisma.client";

export const updateComment = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { message } = req.body;
  if (!message) return next(new AppError("Comment message is required", 400));

  const comment = await prisma.comment.findFirst({
    where: { id: req.params.commentId },
  });

  if (!comment) return next(new AppError("Comment could not be found", 404));

  await prisma.comment.update({
    where: { id: comment.id },
    data: { message, isEdited: comment.message === message ? false : true },
  });

  res.status(200).json({
    status: "success",
    message: "Comment updated",
  });
});
