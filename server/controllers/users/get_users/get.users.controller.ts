import { Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import prisma from "../../../lib/prisma.client";

export const getUsers = handleAsync(async function (
  req: Request,
  res: Response
) {
  const users = await prisma.user.findMany({});
  const type = req.params.type;
  const typeIsAll = type === "all";
  const regularUsers = users.filter((user) => user.isAdmin !== true);

  res.status(200).json({
    status: "success",
    users: typeIsAll ? users : regularUsers,
  });
});
