"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_user_activities_1 = require("../../controllers/activities/get.user.activities");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.verifyAuth, get_user_activities_1.getUserActivities);
exports.default = router;
