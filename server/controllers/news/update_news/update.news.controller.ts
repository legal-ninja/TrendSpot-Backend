import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AppError } from "../../../helpers/global.error";
import prisma from "../../../lib/prisma.client";
import { slugify } from "../../../helpers/slugify";
import sendPushNotification from "../../../services/push.notification";
import sendEmail from "../../../services/email.service";
import { publishNewsAcceptedEmail } from "../../../views/publish.request.accepted";
import { publishNewsRejectedEmail } from "../../../views/publish.request.rejected";

export const updateNews = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {
    title,
    content,
    image,
    readTime,
    category,
    response,
    authorId,
    fromPublishRequest,
  } = req.body;

  if (!title && !content && !image && !readTime && category)
    return next(
      new AppError("Please provide at least one detail you want to update", 400)
    );

  const news = await prisma.news.findFirst({
    where: {
      AND: [{ slug: req.params.slug }, { id: req.params.newsId }],
    },
  });

  if (!news) return next(new AppError("News could not be found", 404));

  const updatedNews = await prisma.news.update({
    where: {
      id: news.id,
    },
    data: {
      title: title || news.title,
      slug: title ? slugify(title) : news.slug,
      content: content || news.content,
      image: image || news.image,
      category: category || news.category,
      readTime: readTime || news.readTime,
      status: response === "Accepted" ? "published" : news.status,
      isAccepted: response === "Accepted" ? true : news.isAccepted,
      actionTaken: fromPublishRequest ? true : news.actionTaken,
    },
  });

  const currentUser = await prisma.user.findFirst({
    where: { id: authorId },
  });

  if (response === "Accepted") {
    await sendPushNotification({
      token: currentUser?.pushToken!,
      title: "News Publication Approved",
      body: `Hey ${currentUser?.firstName} ${currentUser?.lastName}, Your news has been approved and published!`,
    });
  } else {
    await sendPushNotification({
      token: currentUser?.pushToken!,
      title: "News Publication Rejected",
      body: `Hey ${currentUser?.firstName} ${currentUser?.lastName}, Your news has been rejected and would not be published`,
    });
  }

  if (fromPublishRequest && response === "Rejected") {
    await prisma.news.deleteMany({
      where: { id: news.id },
    });
  }

  const subject = "An Update on your request Publish a News";
  const SENT_FROM = process.env.EMAIL_USER as string;
  const REPLY_TO = process.env.REPLY_TO as string;
  const email = currentUser?.email!;
  const body =
    response === "Accepted"
      ? publishNewsAcceptedEmail(
          currentUser?.firstName!,
          currentUser?.lastName!
        )
      : publishNewsRejectedEmail(
          currentUser?.firstName!,
          currentUser?.lastName!
        );

  try {
    fromPublishRequest &&
      sendEmail({ subject, body, send_to: email, SENT_FROM, REPLY_TO });
    res.status(200).json({
      status: "success",
      message: "News updated successfully",
      updatedNews,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: `Something went wrong. Please try again.`,
    });
  }
});
