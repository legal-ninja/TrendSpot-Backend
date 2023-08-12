import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AppError } from "../../../helpers/global.error";
import prisma from "../../../lib/prisma.client";
import { slugify } from "../../../helpers/slugify";
import { AuthenticatedRequest } from "../../../models/types/auth";

export const addNews = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const { title, content, image, readTime, category } = req.body;

  let missingFields = [];
  let bodyObject = { title, content, image, readTime, category };

  for (let field in bodyObject) {
    if (!req.body[field]) missingFields.push(field);
  }

  const isMissingFieldsOne = missingFields.length === 1;
  const concatenatedMissingFields = missingFields.join(", ");

  if (missingFields.length > 0)
    return next(
      new AppError(
        `news ${concatenatedMissingFields} ${
          isMissingFieldsOne ? "is" : "are"
        } required`,
        400
      )
    );

  const news = await prisma.news.create({
    data: {
      title,
      content,
      image,
      readTime,
      category,
      slug: slugify(title),
      authorId: req.user?.id!,
    },
  });

  res.status(200).json({
    status: "success",
    news,
  });
});
