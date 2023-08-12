import { Router } from "express";
import { getCommentByID } from "../../controllers/comments/get_comments_by_id/get.comments.by.id";
import { getPostComments } from "../../controllers/comments/get_post_comments/get.post.comments";
import { getComments } from "../../controllers/comments/get_comments/get.comments.controller";
import { verifyAuth } from "../../middleware/auth.middleware";
import { addComment } from "../../controllers/comments/add_comment/add.comment.controller";
import { updateComment } from "../../controllers/comments/update_comment/update.comment.controller";
import { verifyAccountStatus } from "../../middleware/account.status";

const router = Router();

router
  .route("/:commentId")
  .patch(verifyAuth, verifyAccountStatus, updateComment);
router.route("/:postId/:commentId").get(getCommentByID);
router.route("/:postId").get(getPostComments);
router
  .route("/")
  .get(getComments)
  .post(verifyAuth, verifyAccountStatus, addComment);

export default router;
