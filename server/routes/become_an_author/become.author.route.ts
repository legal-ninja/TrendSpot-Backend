import { Router } from "express";
import { becomeAnAuthor } from "../../controllers/become_an_author/become.author.controller";
import { verifyAdmin, verifyAuth } from "../../middleware/auth.middleware";
import { acceptAuthorRequest } from "../../controllers/become_an_author/accept.author.request";
import { getAuthourRequests } from "../../controllers/become_an_author/get.author.requests.controller";
import { verifyGuest } from "../../middleware/verifyGuest";

const router = Router();

router.get("/", verifyAuth, verifyAdmin, getAuthourRequests);
router.post("/", verifyAuth, verifyAdmin, verifyGuest, becomeAnAuthor);
router.post(
  "/accept/:requestId/:userId",
  verifyAuth,
  verifyGuest,
  acceptAuthorRequest
);

export default router;
