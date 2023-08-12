import { NextFunction, Response } from "express";
import handleAsync from "../helpers/async.handler";
import prisma from "../lib/prisma.client";
import { AuthenticatedRequest } from "../models/types/auth";
import { AppError } from "../helpers/global.error";

export const verifyAccountStatus = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const currentUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: req.body.email }, { id: req.user?.id }],
    },
  });

  if (currentUser?.isDeactivated) {
    let errorMessage;
    currentUser.isDeactivatedByAdmin
      ? (errorMessage =
          "Your account has been deactivated by the admin. Please file an appeal through our contact channels")
      : (errorMessage =
          "Your account is currently deactivated, reactivate your account to continue");
    return next(new AppError(errorMessage, 400));
  }

  next();
});
