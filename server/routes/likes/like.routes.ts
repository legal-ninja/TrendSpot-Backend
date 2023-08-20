import { Router } from "express";
import { verifyAuth } from "../../middleware/auth.middleware";
import { verifyAccountStatus } from "../../middleware/account.status";
import { togglePostLike } from "../../controllers/likes/toggle_post_like/toggle.post.like";
import { getUserLikes } from "../../controllers/likes/get_user_likes/get.user.likes.controller";
import { toggleCommentLike } from "../../controllers/likes/toggle_comment_like/toggle.comment.like";
import { getNewsLikes } from "../../controllers/likes/get_news_likes/get.news.likes.controller";

const router = Router();

router.post(
  "/togglePostLike/:newsId",
  verifyAuth,
  verifyAccountStatus,
  togglePostLike
);

router.post(
  "/toggleCommentLike/:commentId",
  verifyAuth,
  verifyAccountStatus,
  toggleCommentLike
);

router.get("/", verifyAuth, getUserLikes);
router.get("/news/:newsId", getNewsLikes);

export default router;
