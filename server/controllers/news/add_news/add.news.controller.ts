import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AppError } from "../../../helpers/global.error";
import prisma from "../../../lib/prisma.client";
import { slugify } from "../../../helpers/slugify";
import { AuthenticatedRequest } from "../../../models/types/auth";
import sendPushNotification from "../../../services/push.notification";
import { publishRequestEmail } from "../../../views/publish.request";
import sendEmail from "../../../services/email.service";

export const addNews = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const {
    title,
    content,
    image,
    readTime,
    category,
    token,
    fromPublishRequest,
  } = req.body;

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
      status: req.user?.isAdmin ? "published" : "draft",
      isAccepted: req.user?.isAdmin ? true : false,
      slug: slugify(title),
      authorId: req.user?.id!,
    },
  });

  req.user?.isAdmin
    ? await prisma.activity.create({
        data: {
          description: "published a news",
          category: "news",
          action: "add",
          userId: req.user?.id!,
        },
      })
    : await prisma.activity.create({
        data: {
          description: "requested to publish a news",
          category: "news",
          action: "add",
          userId: req.user?.id!,
        },
      });

  req.user?.isAdmin
    ? await sendPushNotification({
        token,
        title: "News Published",
        body: `Hey ${req.user?.firstName}, Your news has been published!`,
      })
    : await sendPushNotification({
        token,
        title: "News Publication",
        body: `Hey ${req.user?.firstName}, Your news has been sent to the admins for a review. We would keep in touch!`,
      });

  const adminEmails = [process.env.ADMIN_EMAIL_ONE as string];

  const subject = "News Publication Request";
  const SENT_FROM = process.env.EMAIL_USER as string;
  const REPLY_TO = process.env.REPLY_TO as string;
  const body = publishRequestEmail({
    firstName: req.user?.firstName!,
    lastName: req.user?.lastName!,
    url: "https://trend-spot-admin.vercel.app/notifications",
  });

  adminEmails.map((email) => {
    try {
      sendEmail({ subject, body, send_to: email, SENT_FROM, REPLY_TO });
      req.user?.isAdmin
        ? res.status(200).json({
            status: "success",
            news,
          })
        : res.status(200).json({
            status: "success",
            message: `Your news has been sent to the admins for a review. We would keep in touch!`,
          });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Something went wrong. Please try again.`,
      });
    }
  });
});
