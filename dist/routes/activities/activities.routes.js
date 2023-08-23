"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_user_activities_1 = require("../../controllers/activities/get.user.activities");
const router = (0, express_1.Router)();
router.get("/", get_user_activities_1.getUserActivities);
exports.default = router;
