import { Router } from "express";
import { getUsers } from "../../controllers/users/get_users/get.users.controller";
import { verifyAdmin, verifyAuth } from "../../middleware/auth.middleware";
import {
  updateUser,
  updateMe,
} from "../../controllers/users/update_user/update.user.controller";
import { getSingleUser } from "../../controllers/users/get_single_user/get.single.user";
import { deActivateUser } from "../../controllers/users/deactivate_user/deactivate.user.controller";
import { reActivateUser } from "../../controllers/users/reactiavate_user/reactivate.user.controller";
import { toggleAdminStatus } from "../../controllers/users/user_admin_status/user.admin.status.controller";
import { verifyAccountStatus } from "../../middleware/account.status";
import { changePassword } from "../../controllers/users/update_user/change_password/change.password.controller";
import { verifyGuest } from "../../middleware/verifyGuest";
import { getSingleUserWithToken } from "../../controllers/users/get_single_user/get.user.with.token";

const router = Router();

router.route("/").get(getUsers);

router.put("/account/deactivate", verifyAuth, verifyGuest, deActivateUser);
router.put("/account/reactivate", verifyAuth, verifyGuest, reActivateUser);
router.put(
  "/update-me",
  verifyAccountStatus,
  verifyAuth,
  verifyGuest,
  updateMe
);
router.put(
  "/account/change-password",
  verifyAccountStatus,
  verifyAuth,
  verifyGuest,
  changePassword
);

router.get("/user-with-token/:userId", getSingleUserWithToken);

router.route("/").get(verifyAuth, verifyAdmin, getUsers);
router
  .route("/:userId")
  .get(getSingleUser)
  .put(verifyAuth, verifyGuest, updateUser);
router.put(
  "/account/toggle-admin-status",
  verifyAuth,
  verifyAdmin,
  verifyGuest,
  toggleAdminStatus
);

export default router;
