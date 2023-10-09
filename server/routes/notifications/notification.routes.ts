import { Router } from "express";
import { verifyAuth } from "../../middleware/auth.middleware";
import { getUserNotifications } from "../../controllers/notifications/get.user.notifications";
import { markAsread } from "../../controllers/notifications/mark.as.read";
import { deleteNotification } from "../../controllers/notifications/delete.notification";
import { deleteAllNotifications } from "../../controllers/notifications/delete.all.notifications";

const router = Router();

router.use(verifyAuth);

router.get("/", getUserNotifications);
router.patch("/mark-as-read/:id", markAsread);
router.delete("/", deleteAllNotifications);
router.delete("/:notifId", deleteNotification);

export default router;
