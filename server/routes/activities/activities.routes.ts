import { Router } from "express";
import { getUserActivities } from "../../controllers/activities/get.user.activities";

const router = Router();

router.get("/", getUserActivities);

export default router;
