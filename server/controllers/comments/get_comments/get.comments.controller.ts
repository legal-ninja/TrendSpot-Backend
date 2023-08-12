import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AUTHOR_FIELDS } from "../../../utils";
import prisma from "../../../lib/prisma.client";
import { Prisma } from "@prisma/client";

export const getComments = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const query = req.query;
  let comments;

  switch (query) {
    case null:
      comments = await prisma.comment.findMany({
        include: {
          author: {
            select: AUTHOR_FIELDS,
          },
          children: {
            include: {
              author: {
                select: AUTHOR_FIELDS,
              },
            },
          },
        },
        orderBy: {
          createdAt: Prisma.SortOrder.desc,
        },
      });
      break;
    default:
      comments = await prisma.comment.findMany({
        where: {
          authorId: req.query.authorId as string,
        },
        include: {
          author: {
            select: AUTHOR_FIELDS,
          },
          children: {
            include: {
              author: {
                select: AUTHOR_FIELDS,
              },
            },
          },
        },
        orderBy: {
          createdAt: Prisma.SortOrder.desc,
        },
      });
  }

  res.status(200).json({
    status: "success",
    results: comments.length,
    comments,
  });
});
