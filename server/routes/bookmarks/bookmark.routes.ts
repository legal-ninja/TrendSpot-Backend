import { Router } from "express";
import { verifyAuth } from "../../middleware/auth.middleware";
import { getUserBookmarks } from "../../controllers/bookmarks/get_user_bookmarks/get.user.bookmarks.controller";
import { verifyAccountStatus } from "../../middleware/account.status";
import { removeFromBookmarks } from "../../controllers/bookmarks/remove_bookmark/remove.bookmark.controller";

const router = Router();

router.get("/", verifyAuth, getUserBookmarks);
router.delete(
  "/remove/:bookmarkId",
  verifyAuth,
  verifyAccountStatus,
  removeFromBookmarks
);
// router.post("/addRemoveBookmark/:postId", verifyAuth, addRemoveBookmark);

export default router;
