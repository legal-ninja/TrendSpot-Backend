import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";

export const addComment = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {});
