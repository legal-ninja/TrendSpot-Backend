import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import prisma from "../../../lib/prisma.client";
import { AUTHOR_FIELDS } from "../../../utils";

export const getUserBookmarks = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userBookmarks = await prisma.bookmark.findMany({
    where: {
      userId: req.query.userId as string,
    },
    include: {
      post: {
        include: {
          author: {
            select: AUTHOR_FIELDS,
          },
        },
      },
    },
  });

  res.status(200).json({
    status: "success",
    bookmarks: userBookmarks,
  });
});
