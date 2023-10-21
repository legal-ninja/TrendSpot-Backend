import { Router } from "express";
import { verifyAdmin, verifyAuth } from "../../middleware/auth.middleware";
import { sendOutPushNotification } from "../../controllers/push_notifications/send.push.notifications";
import { verifyGuest } from "../../middleware/verifyGuest";

const router = Router();

router.post("/", verifyAuth, verifyAdmin, verifyGuest, sendOutPushNotification);

export default router;
