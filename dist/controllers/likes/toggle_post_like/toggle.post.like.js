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
exports.togglePostLike = void 0;
const async_handler_1 = __importDefault(require("../../../helpers/async.handler"));
const global_error_1 = require("../../../helpers/global.error");
const prisma_client_1 = __importDefault(require("../../../lib/prisma.client"));
const push_notification_1 = __importDefault(require("../../../services/push.notification"));
exports.togglePostLike = (0, async_handler_1.default)(function (req, res, next) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    return __awaiter(this, void 0, void 0, function* () {
        const { newsId } = req.params;
        if (!newsId)
            return next(new global_error_1.AppError("Please provide the id of the news", 400));
        const newsToLike = yield prisma_client_1.default.news.findFirst({
            where: {
                id: newsId,
            },
            include: {
                likes: true,
                author: true,
            },
        });
        if (!newsToLike)
            return next(new global_error_1.AppError("Post could not be found", 400));
        const userHasLikedNews = (_a = newsToLike === null || newsToLike === void 0 ? void 0 : newsToLike.likes) === null || _a === void 0 ? void 0 : _a.find((like) => { var _a; return like.userId === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); });
        if (userHasLikedNews) {
            yield prisma_client_1.default.like.deleteMany({
                where: {
                    userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                    newsId,
                },
            });
            yield prisma_client_1.default.activity.create({
                data: {
                    description: "removed your like from a news",
                    category: "news",
                    action: "removed like",
                    userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
                    newsId: newsToLike.id,
                },
            });
        }
        else {
            yield prisma_client_1.default.like.create({
                data: {
                    type: "news",
                    userId: (_d = req.user) === null || _d === void 0 ? void 0 : _d.id,
                    newsId,
                },
            });
            yield prisma_client_1.default.activity.create({
                data: {
                    description: "added a like to a news",
                    category: "news",
                    action: "added like",
                    userId: (_e = req.user) === null || _e === void 0 ? void 0 : _e.id,
                    newsId: newsToLike.id,
                },
            });
            if (newsToLike.authorId === ((_f = req.user) === null || _f === void 0 ? void 0 : _f.id)) {
                yield (0, push_notification_1.default)({
                    token: newsToLike.author.pushToken,
                    title: "+1 like",
                    body: `Hey ${(_g = newsToLike.author) === null || _g === void 0 ? void 0 : _g.firstName} ${newsToLike.author.lastName}, ${(_h = req.user) === null || _h === void 0 ? void 0 : _h.firstName} ${(_j = req.user) === null || _j === void 0 ? void 0 : _j.lastName} just liked a news you added`,
                    data: {
                        newsId: newsToLike.id,
                        slug: newsToLike.slug,
                        url: `trendspot://news/${newsToLike.slug}/${newsToLike.id}`,
                    },
                });
                yield prisma_client_1.default.notification.create({
                    data: {
                        description: `${(_k = req.user) === null || _k === void 0 ? void 0 : _k.firstName} ${(_l = req.user) === null || _l === void 0 ? void 0 : _l.lastName} just added a liked a news you added`,
                        category: "news",
                        userId: newsToLike.authorId,
                        newsId: newsToLike.id,
                    },
                });
            }
            else {
                console.log("SAME USER");
            }
        }
        res.status(200).json({
            status: "success",
            message: userHasLikedNews ? "News Unliked" : "News liked",
        });
    });
});
