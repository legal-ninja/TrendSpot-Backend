import { NextFunction, Response } from "express";
import handleAsync from "../helpers/async.handler";
import prisma from "../lib/prisma.client";
import { AuthenticatedRequest } from "../models/types/auth";
import { AppError } from "../helpers/global.error";

export const verifyGuest = handleAsync(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const currentUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: req.body.email }, { id: req.user?.id }],
    },
  });

  if (currentUser?.email === "guestuser@trendspot.com") {
    return next(
      new AppError(
        "The guest account is meant for browsing the app alone.",
        401
      )
    );
  }

  next();
});
