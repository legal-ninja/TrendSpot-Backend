import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "../../../helpers/global.error";

export const checAuthSession = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  let token;
  const headers = req.headers.authorization;
  if (headers && headers.startsWith("Bearer")) token = headers.split(" ")[1];

  if (!token)
    return next(
      new AppError("You are not logged in. Please login to get access", 400)
    );

  try {
    jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    res.status(200).json({
      isAuthenticated: true,
    });
  } catch (error) {
    res.status(200).json({
      isAuthenticated: false,
    });
  }
});
