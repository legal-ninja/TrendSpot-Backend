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
  const { firstName, lastName, avatar, bio, isAdmin, isDeactivated } = req.body;

  if (!firstName && !lastName && !avatar && !bio && !isAdmin && !isDeactivated)
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
      isDeactivated: isDeactivated || existingUser.isDeactivated,
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
  const { firstName, lastName, avatar, bio, isAdmin, isDeactivated } = req.body;

  if (!firstName && !lastName && !avatar && !bio && !isAdmin && !isDeactivated)
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
  if (req.user?.isAdmin) isDeactivated === true;

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
      isDeactivated: isDeactivated || existingUser.isDeactivated,
      isDeactivatedByAdmin: isDeactivated || existingUser.isDeactivatedByAdmin,
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
