import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";

export const deleteUser = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {});
