import { Router } from "express";
import { getUsers } from "../../controllers/users/get_users/get.users.controller";
import { verifyAdmin, verifyAuth } from "../../middleware/auth.middleware";
import {
  updateUser,
  updateMe,
} from "../../controllers/users/update_user/update.user.controller";
import { getSingleUser } from "../../controllers/users/get_single_user/get.single.user";

const router = Router();

router.use(verifyAuth);
router.use(verifyAdmin);

router.route("/").get(getUsers);
router.route("/:userId").get(getSingleUser).put(updateUser);
router.put("/updateMe", updateMe);

export default router;
