"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNews = void 0;
const async_handler_1 = __importDefault(require("../../../helpers/async.handler"));
const global_error_1 = require("../../../helpers/global.error");
const prisma_client_1 = __importDefault(require("../../../lib/prisma.client"));
const slugify_1 = require("../../../helpers/slugify");
const push_notification_1 = __importDefault(require("../../../services/push.notification"));
exports.updateNews = (0, async_handler_1.default)(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { title, content, image, readTime, category, response, authorId, fromPublishRequest, } = req.body;
        if (!title && !content && !image && !readTime && category)
            return next(new global_error_1.AppError("Please provide at least one detail you want to update", 400));
        const news = yield prisma_client_1.default.news.findFirst({
            where: {
                AND: [{ slug: req.params.slug }, { id: req.params.newsId }],
            },
        });
        if (!news)
            return next(new global_error_1.AppError("News could not be found", 404));
        const updatedNews = yield prisma_client_1.default.news.update({
            where: {
                id: news.id,
            },
            data: {
                title: title || news.title,
                slug: title ? (0, slugify_1.slugify)(title) : news.slug,
                content: content || news.content,
                image: image || news.image,
                category: category || news.category,
                readTime: readTime || news.readTime,
                status: response === "Accepted" ? "published" : news.status,
                isAccepted: response === "Accepted" ? true : news.isAccepted,
                actionTaken: fromPublishRequest ? true : news.actionTaken,
            },
        });
        const currentUser = yield prisma_client_1.default.user.findFirst({
            where: { id: authorId },
        });
        if (response === "Accepted") {
            yield (0, push_notification_1.default)({
                token: currentUser === null || currentUser === void 0 ? void 0 : currentUser.pushToken,
                title: "News Publication Approved",
                body: `Hey ${currentUser === null || currentUser === void 0 ? void 0 : currentUser.firstName} ${currentUser === null || currentUser === void 0 ? void 0 : currentUser.lastName}, Your news has been approved and published!`,
            });
        }
        else {
            yield (0, push_notification_1.default)({
                token: currentUser === null || currentUser === void 0 ? void 0 : currentUser.pushToken,
                title: "News Publication Rejected",
                body: `Hey ${currentUser === null || currentUser === void 0 ? void 0 : currentUser.firstName} ${currentUser === null || currentUser === void 0 ? void 0 : currentUser.lastName}, Your news has been rejected and would not be published`,
            });
        }
        res.status(200).json({
            status: "success",
            message: "News updated successfully",
            updatedNews,
        });
    });
});
