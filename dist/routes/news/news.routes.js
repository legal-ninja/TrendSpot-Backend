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
const router = (0, express_1.Router)();
router
    .route("/")
    .get(get_all_news_controller_1.getAllNews)
    .post(auth_middleware_1.verifyAuth, account_status_1.verifyAccountStatus, add_news_controller_1.addNews);
router
    .route("/:slug/:newsId")
    .get(get_single_news_controller_1.getSingleNews)
    .put(auth_middleware_1.verifyAuth, account_status_1.verifyAccountStatus, update_news_controller_1.updateNews)
    .delete(auth_middleware_1.verifyAuth, auth_middleware_1.verifyAdmin, account_status_1.verifyAccountStatus, delete_news_controller_1.deleteNews);
exports.default = router;
