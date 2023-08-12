import { Router } from "express";
import { getAllNews } from "../../controllers/news/get_all_news/get.all.news.controller";
import { addNews } from "../../controllers/news/add_news/add.news.controller";
import { getSingleNews } from "../../controllers/news/get_single_news/get.single.news.controller";
import { updateNews } from "../../controllers/news/update_news/update.news.controller";
import { deleteNews } from "../../controllers/news/delete_news/delete.news.controller";
import { verifyAdmin, verifyAuth } from "../../middleware/auth.middleware";

const router = Router();

router.route("/").get(getAllNews).post(verifyAuth, addNews);
router
  .route("/:slug/:postId")
  .get(getSingleNews)
  .put(verifyAuth, updateNews)
  .delete(verifyAuth, verifyAdmin, deleteNews);

export default router;
