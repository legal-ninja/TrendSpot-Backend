import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import prisma from "../../../lib/prisma.client";
import { AppError } from "../../../helpers/global.error";

export const deleteNews = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const news = await prisma.news.deleteMany({
    where: {
      AND: [{ slug: req.params.slug }, { id: req.params.newsId }],
    },
  });

  if (!news) return next(new AppError("News could not be found", 404));

  res.status(200).json({
    status: "success",
    message: "News has been deleted",
  });
});
