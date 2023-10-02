import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import prisma from "../../../lib/prisma.client";
import { AppError } from "../../../helpers/global.error";

export const getSingleUser = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = await prisma.user.findFirst({
    where: {
      id: req.params.userId,
    },
    include: {
      news: true,
    },
  });

  if (!user) return next(new AppError("User could not be found", 404));

  res.status(200).json({
    status: "success",
    user,
  });
});
