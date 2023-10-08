"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const get_user_notifications_1 = require("../../controllers/notifications/get.user.notifications");
const mark_as_read_1 = require("../../controllers/notifications/mark.as.read");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.verifyAuth, get_user_notifications_1.getUserNotifications);
router.patch("/mark-as-read/:id", auth_middleware_1.verifyAuth, mark_as_read_1.markAsread);
exports.default = router;
