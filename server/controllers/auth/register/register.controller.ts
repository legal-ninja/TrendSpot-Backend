import { NextFunction, Request, Response } from "express";
import { genSaltSync, hashSync } from "bcryptjs";
import handleAsync from "../../../helpers/async.handler";
import { AppError } from "../../../helpers/global.error";
import prisma from "../../../lib/prisma.client";
import { User } from "../../../models/types/user";
import { generateToken } from "../../../helpers/generate.token";

import { welcome } from "../../../views/welcome.email";
import sendEmail from "../../../services/email.service";
import sendPushNotification from "../../../services/push.notification";

export const register = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { firstName, lastName, email, password, isAdmin, avatar, pushToken } =
    req.body;

  let missingFields: string[] = [];
  let bodyObject = {
    firstName,
    lastName,
    email,
    password,
  };

  for (let field in bodyObject) {
    if (!(field in req.body) || !req.body[field as keyof typeof bodyObject])
      missingFields.push(field);
  }

  const isMissingFieldsOne = missingFields.length === 1;
  const concatenatedMissingFields = missingFields.join(", ");

  if (missingFields.length > 0)
    return next(
      new AppError(
        `user ${concatenatedMissingFields} ${
          isMissingFieldsOne ? "is" : "are"
        } required`,
        400
      )
    );

  const userExists = await prisma.user.findFirst({ where: { email } });
  if (userExists) return next(new AppError("Email already in use", 400));

  const salt = genSaltSync(10);
  const passwordHash = hashSync(password, salt);

  const newUser: User = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: passwordHash,
      pushToken: pushToken!,
      avatar: avatar || "",
      bio: "",
      isAdmin,
    },
  });

  await sendPushNotification({
    token: newUser.pushToken!,
    mutableContent: true,
    title: "Welcome To TrendSpot!",
    body: `Hey ${newUser.firstName} ${newUser.lastName}, Welcome to the community! 🌟 Stay updated with the latest news and trends. Dive in now for a fresh perspective! 📰 #TrendSpot #StayInformed`,
    data: {
      url: `trendspot://ExploreScreen`,
    },
  });

  const token = generateToken(newUser.id);
  const { password: _password, ...userWithoutPassword } = newUser;
  const userInfo = { token, ...userWithoutPassword };

  const subject = `Welcome Onboard, ${newUser.firstName}!`;
  const send_to = newUser.email;
  const SENT_FROM = process.env.EMAIL_USER as string;
  const REPLY_TO = process.env.REPLY_TO as string;
  const body = welcome(newUser.lastName);

  try {
    sendEmail({ subject, body, send_to, SENT_FROM, REPLY_TO });
    const token = generateToken(newUser.id);
    const { password: _password, ...userWithoutPassword } = newUser;
    const userInfo = { token, ...userWithoutPassword };
    res.status(200).json({
      status: "success",
      user: userInfo,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: `Something went wrong. Please try again.`,
    });
  }
});
