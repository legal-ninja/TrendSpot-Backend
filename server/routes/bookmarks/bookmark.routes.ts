import { Router } from "express";
import { verifyAuth } from "../../middleware/auth.middleware";
import { getUserBookmarks } from "../../controllers/bookmarks/get_user_bookmarks/get.user.bookmarks.controller";
import { verifyAccountStatus } from "../../middleware/account.status";
import { removeFromBookmarks } from "../../controllers/bookmarks/remove_bookmark/remove.bookmark.controller";
import { toggleBookmark } from "../../controllers/bookmarks/toggle_bookmark/toggle.bookmark.controller";
import { verifyGuest } from "../../middleware/verifyGuest";

const router = Router();

router.get("/", verifyAuth, getUserBookmarks);
router.delete(
  "/remove/:bookmarkId",
  verifyAuth,
  verifyAccountStatus,
  verifyGuest,
  removeFromBookmarks
);
router.post(
  "/toggleBookmark/:newsId",
  verifyAuth,
  verifyAccountStatus,
  verifyGuest,
  toggleBookmark
);

export default router;
