"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const send_push_notifications_1 = require("../../controllers/push_notifications/send.push.notifications");
const verifyGuest_1 = require("../../middleware/verifyGuest");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.verifyAuth, auth_middleware_1.verifyAdmin, verifyGuest_1.verifyGuest, send_push_notifications_1.sendOutPushNotification);
exports.default = router;
