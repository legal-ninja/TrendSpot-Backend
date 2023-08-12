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
exports.updateNews = (0, async_handler_1.default)(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { title, content, image, readTime, category } = req.body;
        if (!title && !content && !image && !readTime && category)
            return next(new global_error_1.AppError("Please provide at least one detail you want to update", 400));
        const post = yield prisma_client_1.default.news.findFirst({
            where: {
                AND: [{ slug: req.params.slug }, { id: req.params.postId }],
            },
        });
        if (!post)
            return next(new global_error_1.AppError("Post could not be found", 404));
        const updatedPost = yield prisma_client_1.default.news.update({
            where: {
                id: post.id,
            },
            data: {
                title: title || post.title,
                slug: title ? (0, slugify_1.slugify)(title) : post.slug,
                content: content || post.content,
                image: image || post.image,
                category: category || post.category,
                readTime: readTime || post.readTime,
            },
        });
        res.status(200).json({
            status: "success",
            updatedPost,
        });
    });
});
