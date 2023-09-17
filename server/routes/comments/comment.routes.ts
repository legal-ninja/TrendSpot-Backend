import { Router } from "express";
import { getCommentByNewsID } from "../../controllers/comments/get_comments_by_id/get.comments.by.id";
import { getPostComments } from "../../controllers/comments/get_post_comments/get.post.comments";
import { getComments } from "../../controllers/comments/get_comments/get.comments.controller";
import { verifyAuth } from "../../middleware/auth.middleware";
import { addComment } from "../../controllers/comments/add_comment/add.comment.controller";
import { updateComment } from "../../controllers/comments/update_comment/update.comment.controller";
import { verifyAccountStatus } from "../../middleware/account.status";
import { verifyGuest } from "../../middleware/verifyGuest";

const router = Router();

router
  .route("/:commentId")
  .patch(verifyAuth, verifyAccountStatus, verifyGuest, updateComment);
router.route("/:newsId").get(getCommentByNewsID);
router.route("/:newsId").get(getPostComments);
router
  .route("/")
  .get(getComments)
  .post(verifyAuth, verifyAccountStatus, verifyGuest, addComment);

export default router;
