import { Router } from "express";
import { getAllNews } from "../../controllers/news/get_all_news/get.all.news.controller";
import { addNews } from "../../controllers/news/add_news/add.news.controller";
import { getSingleNews } from "../../controllers/news/get_single_news/get.single.news.controller";
import { updateNews } from "../../controllers/news/update_news/update.news.controller";
import { deleteNews } from "../../controllers/news/delete_news/delete.news.controller";
import { verifyAdmin, verifyAuth } from "../../middleware/auth.middleware";
import { verifyAccountStatus } from "../../middleware/account.status";
import { getExternalNews } from "../../controllers/news/get_external_news/get.external.news.controller";
import { getUserNews } from "../../controllers/news/get_user_news/get.user.news.controller";

const router = Router();

router.get("/external-news", getExternalNews);
router.get("/user-news/:userId", getUserNews);
router
  .route("/")
  .get(getAllNews)
  .post(verifyAuth, verifyAccountStatus, addNews);
router
  .route("/:slug/:newsId")
  .get(getSingleNews)
  .put(verifyAuth, verifyAccountStatus, updateNews)
  .delete(verifyAuth, verifyAdmin, verifyAccountStatus, deleteNews);

export default router;
