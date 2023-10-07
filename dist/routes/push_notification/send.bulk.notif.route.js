"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const send_bulk_notifications_1 = require("../../controllers/push_notifications/send.bulk.notifications");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.verifyAuth, auth_middleware_1.verifyAdmin, send_bulk_notifications_1.sendBulkPushNotification);
exports.default = router;
