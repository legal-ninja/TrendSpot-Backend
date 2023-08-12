"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_users_controller_1 = require("../../controllers/users/get_users/get.users.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const update_user_controller_1 = require("../../controllers/users/update_user/update.user.controller");
const get_single_user_1 = require("../../controllers/users/get_single_user/get.single.user");
const router = (0, express_1.Router)();
router
    .route("/")
    .get(auth_middleware_1.verifyAuth, auth_middleware_1.verifyAdmin, get_users_controller_1.getUsers)
    .put(auth_middleware_1.verifyAuth, auth_middleware_1.verifyAdmin, update_user_controller_1.updateUser);
router.route("/:userId").get(auth_middleware_1.verifyAuth, auth_middleware_1.verifyAdmin, get_single_user_1.getSingleUser);
exports.default = router;
