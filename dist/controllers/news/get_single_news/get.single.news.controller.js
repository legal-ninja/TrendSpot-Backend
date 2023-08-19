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
exports.getSingleNews = void 0;
const async_handler_1 = __importDefault(require("../../../helpers/async.handler"));
const prisma_client_1 = __importDefault(require("../../../lib/prisma.client"));
const utils_1 = require("../../../utils");
const global_error_1 = require("../../../helpers/global.error");
exports.getSingleNews = (0, async_handler_1.default)(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const news = yield prisma_client_1.default.news.findFirst({
            where: {
                AND: [{ slug: req.params.slug }, { id: req.params.postId }],
            },
            include: {
                author: {
                    select: utils_1.LONG_AUTHOR_FIELDS,
                },
                bookmarks: {
                    include: {
                        user: {
                            select: utils_1.AUTHOR_FIELDS,
                        },
                    },
                },
                comments: {
                    include: {
                        author: {
                            select: utils_1.AUTHOR_FIELDS,
                        },
                    },
                },
                likes: {
                    include: {
                        user: {
                            select: utils_1.LONG_AUTHOR_FIELDS,
                        },
                    },
                },
            },
        });
        if (!news)
            return next(new global_error_1.AppError("News not found", 400));
        res.status(200).json({
            status: "success",
            news,
        });
    });
});
