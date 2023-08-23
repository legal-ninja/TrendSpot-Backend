import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AUTHOR_FIELDS } from "../../../utils";
import prisma from "../../../lib/prisma.client";
import { AuthenticatedRequest } from "../../../models/types/auth";
import { AppError } from "../../../helpers/global.error";

export const addComment = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const { message, parentId, newsId, authorEmail, path, isReplying } = req.body;

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

  await prisma.activity.create({
    data: {
      description:
        parentId === null
          ? "added a comment to a news"
          : "added a reply to a news comment",
      category: "news",
      action: "add comment",
      userId: req.user?.id!,
      newsId,
    },
  });

  const commentAuthor = await prisma.user.findFirst({
    where: {
      email: authorEmail,
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

  // const replySubject = `New Reply on your comment`;
  // const reply_send_to = authorEmail;
  // const commentSubject = `New Comment on your post`;
  // const comment_send_to = authorEmail;
  // const sent_from = process.env.EMAIL_USER as string;
  // const reply_to = process.env.REPLY_TO as string;
  // const replyBody = emailReply(post?.author.firstName!, path, message);
  // const commentBody = commentEmail(commentAuthor?.firstName!, path, message);

  try {
    // if (authorEmail !== req.user?.email) {
    //   sendEmail({
    //     subject: isReplying ? replySubject : commentSubject,
    //     body: isReplying ? replyBody : commentBody,
    //     send_to: isReplying ? reply_send_to : comment_send_to,
    //     sent_from,
    //     reply_to,
    //   });
    // }

    res.status(200).json({
      status: "success",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: `Something went wrong. Please try again.`,
    });
  }
});
