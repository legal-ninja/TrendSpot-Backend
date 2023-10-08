"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_users_controller_1 = require("../../controllers/users/get_users/get.users.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const update_user_controller_1 = require("../../controllers/users/update_user/update.user.controller");
const get_single_user_1 = require("../../controllers/users/get_single_user/get.single.user");
const deactivate_user_controller_1 = require("../../controllers/users/deactivate_user/deactivate.user.controller");
const reactivate_user_controller_1 = require("../../controllers/users/reactiavate_user/reactivate.user.controller");
const user_admin_status_controller_1 = require("../../controllers/users/user_admin_status/user.admin.status.controller");
const account_status_1 = require("../../middleware/account.status");
const change_password_controller_1 = require("../../controllers/users/update_user/change_password/change.password.controller");
const verifyGuest_1 = require("../../middleware/verifyGuest");
const get_user_with_token_1 = require("../../controllers/users/get_single_user/get.user.with.token");
const router = (0, express_1.Router)();
router.route("/tUsers/:type").get(auth_middleware_1.verifyAuth, get_users_controller_1.getUsers);
router.put("/account/deactivate", auth_middleware_1.verifyAuth, verifyGuest_1.verifyGuest, deactivate_user_controller_1.deActivateUser);
router.put("/account/reactivate", auth_middleware_1.verifyAuth, verifyGuest_1.verifyGuest, reactivate_user_controller_1.reActivateUser);
router.put("/update-me", account_status_1.verifyAccountStatus, auth_middleware_1.verifyAuth, verifyGuest_1.verifyGuest, update_user_controller_1.updateMe);
router.put("/account/change-password", account_status_1.verifyAccountStatus, auth_middleware_1.verifyAuth, verifyGuest_1.verifyGuest, change_password_controller_1.changePassword);
router.get("/user-with-token/:userId", get_user_with_token_1.getSingleUserWithToken);
router
    .route("/:userId")
    .get(get_single_user_1.getSingleUser)
    .put(auth_middleware_1.verifyAuth, verifyGuest_1.verifyGuest, update_user_controller_1.updateUser);
router.put("/account/toggle-admin-status", auth_middleware_1.verifyAuth, auth_middleware_1.verifyAdmin, verifyGuest_1.verifyGuest, user_admin_status_controller_1.toggleAdminStatus);
exports.default = router;
