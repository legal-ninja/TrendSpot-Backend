"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_comments_by_id_1 = require("../../controllers/comments/get_comments_by_id/get.comments.by.id");
const get_post_comments_1 = require("../../controllers/comments/get_post_comments/get.post.comments");
const get_comments_controller_1 = require("../../controllers/comments/get_comments/get.comments.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const add_comment_controller_1 = require("../../controllers/comments/add_comment/add.comment.controller");
const update_comment_controller_1 = require("../../controllers/comments/update_comment/update.comment.controller");
const account_status_1 = require("../../middleware/account.status");
const verifyGuest_1 = require("../../middleware/verifyGuest");
const router = (0, express_1.Router)();
router
    .route("/:commentId")
    .patch(auth_middleware_1.verifyAuth, account_status_1.verifyAccountStatus, verifyGuest_1.verifyGuest, update_comment_controller_1.updateComment);
router.route("/:newsId").get(get_comments_by_id_1.getCommentByNewsID);
router.route("/:newsId").get(get_post_comments_1.getPostComments);
router
    .route("/")
    .get(get_comments_controller_1.getComments)
    .post(auth_middleware_1.verifyAuth, account_status_1.verifyAccountStatus, verifyGuest_1.verifyGuest, add_comment_controller_1.addComment);
exports.default = router;
