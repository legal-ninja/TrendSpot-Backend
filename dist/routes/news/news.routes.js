"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_all_news_controller_1 = require("../../controllers/news/get_all_news/get.all.news.controller");
const add_news_controller_1 = require("../../controllers/news/add_news/add.news.controller");
const get_single_news_controller_1 = require("../../controllers/news/get_single_news/get.single.news.controller");
const update_news_controller_1 = require("../../controllers/news/update_news/update.news.controller");
const delete_news_controller_1 = require("../../controllers/news/delete_news/delete.news.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const account_status_1 = require("../../middleware/account.status");
const get_external_news_controller_1 = require("../../controllers/news/get_external_news/get.external.news.controller");
const get_user_news_controller_1 = require("../../controllers/news/get_user_news/get.user.news.controller");
const verifyGuest_1 = require("../../middleware/verifyGuest");
const get_drafted_news_controller_1 = require("../../controllers/news/get_drafted_news/get.drafted.news.controller");
const router = (0, express_1.Router)();
router.get("/external-news", get_external_news_controller_1.getExternalNews);
router.get("/drafts", get_drafted_news_controller_1.getDraftedNews);
router.get("/user-news/:userId", get_user_news_controller_1.getUserNews);
router
    .route("/")
    .get(get_all_news_controller_1.getAllNews)
    .post(auth_middleware_1.verifyAuth, account_status_1.verifyAccountStatus, verifyGuest_1.verifyGuest, add_news_controller_1.addNews);
router
    .route("/:slug/:newsId")
    .get(get_single_news_controller_1.getSingleNews)
    .put(auth_middleware_1.verifyAuth, account_status_1.verifyAccountStatus, verifyGuest_1.verifyGuest, update_news_controller_1.updateNews)
    .delete(auth_middleware_1.verifyAuth, auth_middleware_1.verifyAdmin, account_status_1.verifyAccountStatus, verifyGuest_1.verifyGuest, delete_news_controller_1.deleteNews);
exports.default = router;
