import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AppError } from "../../../helpers/global.error";
import { AuthenticatedRequest } from "../../../models/types/auth";
import prisma from "../../../lib/prisma.client";

export const toggleAdminStatus = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const { userId } = req.body;

  if (!userId) return next(new AppError("Please specify the user id", 404));

  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!existingUser) return next(new AppError("User could not be found", 404));
  if (existingUser.email === "trendspot@admin.com")
    return next(
      new AppError("Invalid operation. This user is a super admin", 401)
    );

  await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      isAdmin: existingUser.isAdmin ? false : true,
    },
  });

  res.status(200).json({
    status: "success",
    message: existingUser.isAdmin
      ? "User has been removed as an admin"
      : "User has been made an admin",
  });
});
