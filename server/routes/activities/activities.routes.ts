import { Router } from "express";
import { getUserActivities } from "../../controllers/activities/get.user.activities";
import { verifyAuth } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", verifyAuth, getUserActivities);

export default router;
