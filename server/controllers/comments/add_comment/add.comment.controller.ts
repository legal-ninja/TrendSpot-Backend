import { NextFunction, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AUTHOR_FIELDS } from "../../../utils";
import prisma from "../../../lib/prisma.client";
import { AuthenticatedRequest } from "../../../models/types/auth";
import { AppError } from "../../../helpers/global.error";
import sendPushNotification from "../../../services/push.notification";

export const addComment = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const {
    message,
    parentId,
    newsId,
    authorEmail,
    authorId,
    replyerName,
    path,
    isReplying,
  } = req.body;

  let missingFields = [];
  let bodyObject = { message, newsId, authorEmail, path };

  for (let field in bodyObject) {
    if (!req.body[field]) missingFields.push(field);
  }

  const isMissingFieldsOne = missingFields.length === 1;
  const concatenatedMissingFields = missingFields.join(", ");

  if (missingFields.length > 0)
    return next(
      new AppError(
        `comment ${concatenatedMissingFields} ${
          isMissingFieldsOne ? "is" : "are"
        } required`,
        400
      )
    );

  const comment = await prisma.comment.create({
    data: {
      message,
      authorId: req.user?.id!,
      parentId,
      newsId,
    },
  });

  const user = await prisma.user.findFirst({
    where: {
      id: authorId,
    },
  });

  await prisma.notification.create({
    data: {
      description:
        parentId === null
          ? `${replyerName} added a comment to a news you added`
          : `${replyerName} added a reply to a comment you added`,
      category: "news",
      userId: authorId,
      newsId,
    },
  });

  const commentAuthor = await prisma.user.findFirst({
    where: {
      OR: [{ email: authorEmail }, { firstName: authorEmail[0] }],
    },
  });

  const news = await prisma.news.findFirst({
    where: {
      id: newsId,
    },
    include: {
      author: {
        select: AUTHOR_FIELDS,
      },
    },
  });

  const REPLY_SUBJECT = "New Reply to your comment";
  const COMMENT_SUBJECT = "New Comment on your post";

  await prisma.notification.create({
    data: {
      description: isReplying ? REPLY_SUBJECT : COMMENT_SUBJECT,
      category: "comment",
      userId: req.user?.id!,
    },
  });

  console.log({ token: commentAuthor?.pushToken });
  console.log({ token2: user?.pushToken! });
  console.log({ isReplying });

  await sendPushNotification({
    token: isReplying ? commentAuthor?.pushToken! : user?.pushToken!,
    title: "TrendSpot",
    body:
      parentId === null
        ? `Hey ${user?.firstName} ${user?.lastName}, ${replyerName} added a comment to a news you added`
        : `Hey ${commentAuthor?.firstName} ${commentAuthor?.lastName}, ${replyerName} added a reply to your comment on a news`,

    data: {
      newsId: req.params.newsId,
      slug: req.params.slug,
      url: `trendspot://news/${news?.slug}/${newsId}`,
    },
  });

  res.status(200).json({
    status: "success",
    comment,
  });
});
