import { Router } from "express";
import { verifyAuth } from "../../middleware/auth.middleware";
import { getUserNotifications } from "../../controllers/notifications/get.user.notifications";
import { markAsread } from "../../controllers/notifications/mark.as.read";

const router = Router();

router.get("/", verifyAuth, getUserNotifications);
router.patch("/mark-as-read/:id", verifyAuth, markAsread);

export default router;
