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
exports.addComment = (0, async_handler_1.default)(function (req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { message, parentId, newsId, authorEmail, path, isReplying } = req.body;
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
                parentId: parentId,
                newsId,
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
        // const replySubject = `New Reply on your comment`;
        // const reply_send_to = authorEmail;
        // const commentSubject = `New Comment on your post`;
        // const comment_send_to = authorEmail;
        // const sent_from = process.env.EMAIL_USER as string;
        // const reply_to = process.env.REPLY_TO as string;
        // const replyBody = emailReply(post?.author.firstName!, path, message);
        // const commentBody = commentEmail(commentAuthor?.firstName!, path, message);
        try {
            // if (authorEmail !== req.user?.email) {
            //   sendEmail({
            //     subject: isReplying ? replySubject : commentSubject,
            //     body: isReplying ? replyBody : commentBody,
            //     send_to: isReplying ? reply_send_to : comment_send_to,
            //     sent_from,
            //     reply_to,
            //   });
            // }
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
