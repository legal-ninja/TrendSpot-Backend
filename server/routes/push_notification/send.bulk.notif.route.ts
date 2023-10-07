import { Router } from "express";
import { sendBulkPushNotification } from "../../controllers/push_notifications/send.bulk.notifications";
import { verifyAdmin, verifyAuth } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", verifyAuth, verifyAdmin, sendBulkPushNotification);

export default router;
