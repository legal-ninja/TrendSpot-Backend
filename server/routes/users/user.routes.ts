import { Router } from "express";
import { getUsers } from "../../controllers/users/get_users/get.users.controller";
import { verifyAdmin, verifyAuth } from "../../middleware/auth.middleware";
import { updateUser } from "../../controllers/users/update_user/update.user.controller";
import { getSingleUser } from "../../controllers/users/get_single_user/get.single.user";

const router = Router();

router
  .route("/")
  .get(verifyAuth, verifyAdmin, getUsers)
  .put(verifyAuth, verifyAdmin, updateUser);

router.route("/:userId").get(verifyAuth, verifyAdmin, getSingleUser);

export default router;
