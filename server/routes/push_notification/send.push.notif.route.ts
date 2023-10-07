import { Router } from "express";
import { verifyAdmin, verifyAuth } from "../../middleware/auth.middleware";
import { sendOutPushNotification } from "../../controllers/push_notifications/send.push.notifications";

const router = Router();

router.post("/", verifyAuth, verifyAdmin, sendOutPushNotification);

export default router;
