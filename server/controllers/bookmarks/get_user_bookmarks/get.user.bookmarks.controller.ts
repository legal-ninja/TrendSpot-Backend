import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import prisma from "../../../lib/prisma.client";
import { AUTHOR_FIELDS } from "../../../utils";
import { log } from "console";

export const getUserBookmarks = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("heree");
  console.log(req.query.userId);

  const userBookmarks = await prisma.bookmark.findMany({
    where: {
      userId: req.query.userId as string,
    },
    include: {
      news: {
        include: {
          author: {
            select: AUTHOR_FIELDS,
          },
        },
      },
    },
  });

  console.log({ userBookmarks });

  res.status(200).json({
    status: "success",
    bookmarks: userBookmarks,
  });
});
