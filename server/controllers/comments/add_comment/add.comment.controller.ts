import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AUTHOR_FIELDS } from "../../../utils";
import prisma from "../../../lib/prisma.client";
import { AuthenticatedRequest } from "../../../models/types/auth";
import { AppError } from "../../../helpers/global.error";
import sendEmail from "../../../services/email.service";
import { emailReply } from "../../../views/reply.email";
import { commentEmail } from "../../../views/comment.email";
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

  const REPLY_SUBJECT = `New Reply to your comment`;
  const REPLY_SEND_TO = authorEmail;
  const COMMENT_SUBJECT = `New Comment on your post`;
  const COMMENT_SEND_TO = authorEmail;
  const SENT_FROM = process.env.EMAIL_USER as string;
  const REPLY_TO = process.env.REPLY_TO as string;
  const PATH = "exp://172.20.10.10:19000";
  const REPLY_BODY = emailReply(news?.author.firstName!, PATH, message);
  const COMMENT_BODY = commentEmail(commentAuthor?.firstName!, PATH, message);

  // await sendPushNotification({
  //   token: commentAuthor?.pushToken || "",
  //   title: "TrendSpot",
  //   body: isReplying ? REPLY_SUBJECT : COMMENT_SUBJECT,
  // });

  await prisma.notification.create({
    data: {
      description: isReplying ? REPLY_SUBJECT : COMMENT_SUBJECT,
      category: "comment",
      userId: req.user?.id!,
    },
  });

  await sendPushNotification({
    token: user?.pushToken!,
    title: "TrendSpot",
    body:
      parentId === null
        ? `Hey ${user?.firstName} ${user?.lastName}, ${replyerName} added a comment to a news you added`
        : `Hey ${user?.firstName} ${user?.lastName}, ${replyerName} added a reply to your comment on a news`,

    data: {
      newsId: req.params.newsId,
      slug: req.params.slug,
      url: `trendspot://news/${news?.slug}/${newsId}`,
    },
  });

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
