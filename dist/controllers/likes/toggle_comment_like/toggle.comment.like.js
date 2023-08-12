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
exports.toggleCommentLike = void 0;
const async_handler_1 = __importDefault(require("../../../helpers/async.handler"));
const global_error_1 = require("../../../helpers/global.error");
const prisma_client_1 = __importDefault(require("../../../lib/prisma.client"));
exports.toggleCommentLike = (0, async_handler_1.default)(function (req, res, next) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const { commentId } = req.params;
        if (!commentId)
            return next(new global_error_1.AppError("Please provide the id of the comment", 400));
        const commentToLike = yield prisma_client_1.default.comment.findFirst({
            where: {
                id: commentId,
            },
            include: {
                likes: true,
            },
        });
        if (!commentToLike)
            return next(new global_error_1.AppError("Comment could not be found", 400));
        const userHasLikedComment = (_a = commentToLike === null || commentToLike === void 0 ? void 0 : commentToLike.likes) === null || _a === void 0 ? void 0 : _a.find((like) => { var _a; return like.userId === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); });
        if (userHasLikedComment) {
            yield prisma_client_1.default.like.deleteMany({
                where: {
                    userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                    commentId,
                },
            });
        }
        else {
            yield prisma_client_1.default.like.create({
                data: {
                    type: "comment",
                    userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
                    commentId,
                },
            });
        }
        res.status(200).json({
            status: "success",
            message: userHasLikedComment ? "Comment Unliked" : "Comment liked",
        });
    });
});
