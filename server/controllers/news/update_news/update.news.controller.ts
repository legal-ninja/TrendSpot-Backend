import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AppError } from "../../../helpers/global.error";
import prisma from "../../../lib/prisma.client";
import { slugify } from "../../../helpers/slugify";

export const updateNews = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { title, content, image, readTime, category } = req.body;

  if (!title && !content && !image && !readTime && category)
    return next(
      new AppError("Please provide at least one detail you want to update", 400)
    );

  const post = await prisma.news.findFirst({
    where: {
      AND: [{ slug: req.params.slug }, { id: req.params.postId }],
    },
  });

  if (!post) return next(new AppError("Post could not be found", 404));

  const updatedPost = await prisma.news.update({
    where: {
      id: post.id,
    },
    data: {
      title: title || post.title,
      slug: title ? slugify(title) : post.slug,
      content: content || post.content,
      image: image || post.image,
      category: category || post.category,
      readTime: readTime || post.readTime,
    },
  });

  res.status(200).json({
    status: "success",
    updatedPost,
  });
});
