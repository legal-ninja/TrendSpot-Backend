import { Router } from "express";
import { verifyAuth } from "../../middleware/auth.middleware";
import { verifyAccountStatus } from "../../middleware/account.status";
import { togglePostLike } from "../../controllers/likes/toggle_post_like/toggle.post.like";
import { getUserLikes } from "../../controllers/likes/get_user_likes/get.user.likes.controller";

const router = Router();

router.post(
  "/togglePostLike/:newsId",
  verifyAuth,
  verifyAccountStatus,
  togglePostLike
);
router.get("/", verifyAuth, getUserLikes);

export default router;
