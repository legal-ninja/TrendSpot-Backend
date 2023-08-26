import { NextFunction, Response } from "express";
import handleAsync from "../../../../helpers/async.handler";
import { AuthenticatedRequest } from "../../../../models/types/auth";
import { AppError } from "../../../../helpers/global.error";
import prisma from "../../../../lib/prisma.client";
import { compare, genSaltSync, hashSync } from "bcryptjs";

export const changePassword = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const currentUser = await prisma.user.findFirst({
    where: {
      id: req.user?.id,
    },
  });

  if (!currentUser) return next(new AppError("Could not find user", 404));
  if (newPassword !== confirmNewPassword)
    return next(new AppError("New password credentials do not match", 400));
  const passwordIscorrect = await compare(oldPassword, currentUser.password);

  if (!passwordIscorrect)
    return next(new AppError("Old password is incorrect", 400));

  const salt = genSaltSync(10);
  const passwordHash = hashSync(newPassword, salt);

  await prisma.user.update({
    where: { id: req.user?.id },
    data: {
      password: passwordHash,
    },
  });

  await prisma.activity.create({
    data: {
      description: "updated your account password",
      category: "account",
      action: "update account password",
      userId: req.user?.id!,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Your password has been updated",
  });
});
