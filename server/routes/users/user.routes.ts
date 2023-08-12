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

const router = Router();

router.use(verifyAuth);

router.put("/account/deactivate", deActivateUser);
router.put("/account/reactivate", reActivateUser);
router.put("/update-me", updateMe);

router.use(verifyAdmin);

router.route("/").get(getUsers);
router.route("/:userId").get(getSingleUser).put(updateUser);
router.put("/account/toggle-admin-status", toggleAdminStatus);

export default router;
