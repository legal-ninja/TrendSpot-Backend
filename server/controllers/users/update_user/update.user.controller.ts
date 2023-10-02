import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AppError } from "../../../helpers/global.error";
import prisma from "../../../lib/prisma.client";
import { generateToken } from "../../../helpers/generate.token";
import { AuthenticatedRequest } from "../../../models/types/auth";

export const updateMe = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const { firstName, lastName, avatar, bio, isAdmin } = req.body;

  if (isAdmin) {
    return next(
      new AppError("You are not allowed to change your admin status", 400)
    );
  }

  if (!firstName && !lastName && !avatar && !bio)
    return next(
      new AppError(
        "Please provide at least one credential you want to update",
        400
      )
    );

  const existingUser = await prisma.user.findFirst({
    where: {
      id: req.user?.id,
    },
  });

  if (!existingUser) return next(new AppError("User could not be found", 404));

  const user = await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      firstName: firstName || existingUser.firstName,
      lastName: lastName || existingUser.lastName,
      avatar: avatar || existingUser.avatar,
      bio: bio || existingUser.bio,
      isAdmin: isAdmin || existingUser.isAdmin,
    },
  });

  await prisma.activity.create({
    data: {
      description: "updated your account information",
      category: "account",
      action: "update account",
      userId: req.user?.id!,
    },
  });

  const token = generateToken(existingUser.id);
  const { password: _password, ...userWithoutPassword } = user;
  const updatedUser = { token, ...userWithoutPassword };

  res.status(200).json({
    status: "success",
    updatedUser,
  });
});

export const updateUser = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const {
    firstName,
    lastName,
    avatar,
    bio,
    pushToken,
    isDeactivated,
    isDeactivatedByAdmin,
  } = req.body;

  if (isDeactivated || isDeactivatedByAdmin)
    return next(
      new AppError(
        "Invalid operation. User activation status cannot be updated from this route.",
        400
      )
    );

  if (!firstName && !lastName && !avatar && !bio && !pushToken)
    return next(
      new AppError(
        "Please provide at least one credential you want to update",
        400
      )
    );

  const existingUser = await prisma.user.findFirst({
    where: {
      id: req.params.userId,
    },
  });

  if (!existingUser) return next(new AppError("User could not be found", 404));

  const updatedUser = await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      firstName: firstName || existingUser.firstName,
      lastName: lastName || existingUser.lastName,
      avatar: avatar || existingUser.avatar,
      pushToken: pushToken || existingUser.pushToken || null,
      bio: bio || existingUser.bio,
    },
  });

  res.status(200).json({
    status: "success",
    message: "User updated successfully",
    updatedUser,
  });
});
