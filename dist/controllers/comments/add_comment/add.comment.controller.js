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
exports.addComment = void 0;
const async_handler_1 = __importDefault(require("../../../helpers/async.handler"));
const utils_1 = require("../../../utils");
const prisma_client_1 = __importDefault(require("../../../lib/prisma.client"));
const global_error_1 = require("../../../helpers/global.error");
const email_service_1 = __importDefault(require("../../../services/email.service"));
const reply_email_1 = require("../../../views/reply.email");
const comment_email_1 = require("../../../views/comment.email");
const push_notification_1 = __importDefault(require("../../../services/push.notification"));
exports.addComment = (0, async_handler_1.default)(function (req, res, next) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const { message, parentId, newsId, authorEmail, authorId, replyerName, path, isReplying, } = req.body;
        let missingFields = [];
        let bodyObject = { message, newsId, authorEmail, path };
        for (let field in bodyObject) {
            if (!req.body[field])
                missingFields.push(field);
        }
        const isMissingFieldsOne = missingFields.length === 1;
        const concatenatedMissingFields = missingFields.join(", ");
        if (missingFields.length > 0)
            return next(new global_error_1.AppError(`comment ${concatenatedMissingFields} ${isMissingFieldsOne ? "is" : "are"} required`, 400));
        const comment = yield prisma_client_1.default.comment.create({
            data: {
                message,
                authorId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                parentId,
                newsId,
            },
        });
        const user = yield prisma_client_1.default.user.findFirst({
            where: {
                id: authorId,
            },
        });
        yield prisma_client_1.default.notification.create({
            data: {
                description: parentId === null
                    ? `${replyerName} added a comment to a news you added`
                    : `${replyerName} added a reply to a comment you added`,
                category: "comment",
                userId: authorId,
            },
        });
        yield (0, push_notification_1.default)({
            token: user === null || user === void 0 ? void 0 : user.pushToken,
            title: "TrendSpot",
            body: parentId === null
                ? `Hey ${user === null || user === void 0 ? void 0 : user.firstName} ${user === null || user === void 0 ? void 0 : user.lastName}, ${replyerName} added a comment to a news you added`
                : `Hey ${user === null || user === void 0 ? void 0 : user.firstName} ${user === null || user === void 0 ? void 0 : user.lastName}, ${replyerName} added a reply to your comment on a news`,
            data: {
                newsId: req.params.newsId,
                slug: req.params.slug,
                url: `trendspot://news/${req.params.slug}/${req.params.newsId}`,
            },
        });
        const commentAuthor = yield prisma_client_1.default.user.findFirst({
            where: {
                email: authorEmail,
            },
        });
        const news = yield prisma_client_1.default.news.findFirst({
            where: {
                id: newsId,
            },
            include: {
                author: {
                    select: utils_1.AUTHOR_FIELDS,
                },
            },
        });
        const REPLY_SUBJECT = `New Reply to your comment`;
        const REPLY_SEND_TO = authorEmail;
        const COMMENT_SUBJECT = `New Comment on your post`;
        const COMMENT_SEND_TO = authorEmail;
        const SENT_FROM = process.env.EMAIL_USER;
        const REPLY_TO = process.env.REPLY_TO;
        const PATH = "exp://172.20.10.10:19000";
        const REPLY_BODY = (0, reply_email_1.emailReply)(news === null || news === void 0 ? void 0 : news.author.firstName, PATH, message);
        const COMMENT_BODY = (0, comment_email_1.commentEmail)(commentAuthor === null || commentAuthor === void 0 ? void 0 : commentAuthor.firstName, PATH, message);
        yield (0, push_notification_1.default)({
            token: (commentAuthor === null || commentAuthor === void 0 ? void 0 : commentAuthor.pushToken) || "",
            title: "TrendSpot",
            body: isReplying ? REPLY_SUBJECT : COMMENT_SUBJECT,
        });
        yield prisma_client_1.default.notification.create({
            data: {
                description: isReplying ? REPLY_SUBJECT : COMMENT_SUBJECT,
                category: "comment",
                userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            },
        });
        try {
            if (authorEmail !== ((_c = req.user) === null || _c === void 0 ? void 0 : _c.email)) {
                (0, email_service_1.default)({
                    subject: isReplying ? REPLY_SUBJECT : COMMENT_SUBJECT,
                    body: isReplying ? REPLY_BODY : COMMENT_BODY,
                    send_to: isReplying ? REPLY_SEND_TO : COMMENT_SEND_TO,
                    SENT_FROM,
                    REPLY_TO,
                });
            }
            res.status(200).json({
                status: "success",
                comment,
            });
        }
        catch (error) {
            res.status(500).json({
                status: "fail",
                message: `Something went wrong. Please try again.`,
            });
        }
    });
});
