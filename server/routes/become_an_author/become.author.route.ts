import { Router } from "express";
import { becomeAnAuthor } from "../../controllers/become_an_author/become.author.controller";
import { verifyAuth } from "../../middleware/auth.middleware";
import { acceptAuthorRequest } from "../../controllers/become_an_author/accept.author.request";

const router = Router();

router.post("/", verifyAuth, becomeAnAuthor);
router.post("/accept/:requestId/:userId", verifyAuth, acceptAuthorRequest);

export default router;
