import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AUTHOR_FIELDS } from "../../../utils";
import prisma from "../../../lib/prisma.client";
import { AuthenticatedRequest } from "../../../models/types/auth";
import { AppError } from "../../../helpers/global.error";
import sendEmail from "../../../services/email.service";
import { emailReply } from "../../../views/reply.email";
import { commentEmail } from "../../../views/comment.email";

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

  const REPLY_SUBJECT = `New Reply on your comment`;
  const REPLY_SEND_TO = authorEmail;
  const COMMENT_SUBJECT = `New Comment on your post`;
  const COMMENT_SEND_TO = authorEmail;
  const SENT_FROM = process.env.EMAIL_USER as string;
  const REPLY_TO = process.env.REPLY_TO as string;
  const PATH = "exp://172.20.10.10:19000";
  const REPLY_BODY = emailReply(news?.author.firstName!, PATH, message);
  const COMMENT_BODY = commentEmail(commentAuthor?.firstName!, PATH, message);

  try {
    if (authorEmail !== req.user?.email) {
      sendEmail({
        subject: isReplying ? REPLY_SUBJECT : COMMENT_SUBJECT,
        body: isReplying ? REPLY_BODY : COMMENT_BODY,
        send_to: isReplying ? REPLY_SEND_TO : COMMENT_SEND_TO,
        SENT_FROM,
        REPLY_TO,
      });
    }
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
