import express, { json } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { AppError } from "./helpers/global.error";
import errorHandler from "./helpers/error";
import userRouter from "./routes/users/user.routes";
import authRouter from "./routes/auth/auth.routes";
import newsRouter from "./routes/news/news.routes";
import commentRouter from "./routes/comments/comment.routes";
import likeRouter from "./routes/likes/like.routes";
import bookmarkRouter from "./routes/bookmarks/bookmark.routes";
import activityRouter from "./routes/activities/activities.routes";
import becomeAuthorRouter from "./routes/become_an_author/become.author.route";
import pushNotificationRouter from "./routes/push_notification/send.push.notif.route";
import notificationRouter from "./routes/notifications/notification.routes";
import path from "path";

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(json());
app.use(cookieParser());
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "exp://172.20.10.10:19000",
      "http://localhost:19006",
      "https://trend-spot-admin.vercel.app",
      "https://trendspotadmin.vercel.app"
    ],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use((req, res, next) => {
  next();
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/news", newsRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/bookmarks", bookmarkRouter);
app.use("/api/v1/activities", activityRouter);
app.use("/api/v1/become-author", becomeAuthorRouter);
app.use("/api/v1/push-notification", pushNotificationRouter);
app.use("/api/v1/notifications", notificationRouter);

app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} with method ${req.method} on this server`,
      404
    )
  );
});

app.use(errorHandler);

export default app;
