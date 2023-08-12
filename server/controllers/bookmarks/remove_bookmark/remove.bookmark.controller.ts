import { NextFunction, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import { AuthenticatedRequest } from "../../../models/types/auth";
import prisma from "../../../lib/prisma.client";

export const removeFromBookmarks = handleAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { bookmarkId } = req.params;

    await prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Bookmark removed",
    });
  }
);
