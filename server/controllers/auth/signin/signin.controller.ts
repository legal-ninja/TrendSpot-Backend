import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { LoginPayload } from "../../../models/types/auth";
import { AppError } from "../../../helpers/global.error";
import prisma from "../../../lib/prisma.client";
import { User } from "../../../models/types/user";
import { compare } from "bcryptjs";
import { generateToken } from "../../../helpers/generate.token";

export const signin = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password }: LoginPayload = req.body;

  let missingFields = [];
  let bodyObject = { email, password };

  for (let field in bodyObject) {
    if (!req.body[field]) missingFields.push(field);
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

  const user: User | null = await prisma.user.findFirst({ where: { email } });
  if (!user) return next(new AppError("Invalid credentials provided", 400));

  const passwordIscorrect = await compare(password, user.password);

  if (!passwordIscorrect)
    return next(new AppError("Invalid credentials provided", 400));

  const token = generateToken(user.id);
  const { password: _password, ...userWithoutPassword } = user;

  const userInfo = { token, ...userWithoutPassword };

  res.status(200).json({
    status: "success",
    user: userInfo,
  });
});
