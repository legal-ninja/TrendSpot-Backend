import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import prisma from "../../../lib/prisma.client";
import { AUTHOR_FIELDS } from "../../../utils";

export const getNewsLikes = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const newsLikes = await prisma.like.findMany({
    where: {
      newsId: req.params.newsId as string,
    },
    include: {
      user: {
        select: AUTHOR_FIELDS,
      },
    },
  });

  res.status(200).json({
    status: "success",
    likes: newsLikes,
  });
});
