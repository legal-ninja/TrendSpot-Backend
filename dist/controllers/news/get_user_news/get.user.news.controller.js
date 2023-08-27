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
exports.getUserNews = void 0;
const async_handler_1 = __importDefault(require("../../../helpers/async.handler"));
const prisma_client_1 = __importDefault(require("../../../lib/prisma.client"));
const utils_1 = require("../../../utils");
const client_1 = require("@prisma/client");
exports.getUserNews = (0, async_handler_1.default)(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const news = yield prisma_client_1.default.news.findMany({
            where: {
                authorId: req.params.userId,
            },
            include: {
                author: {
                    select: Object.assign(Object.assign({}, utils_1.LONG_AUTHOR_FIELDS), { news: false }),
                },
                likes: {
                    include: {
                        user: {
                            select: Object.assign(Object.assign({}, utils_1.LIKE_FIELDS), { news: false }),
                        },
                    },
                },
                bookmarks: true,
                comments: true,
            },
            orderBy: {
                createdAt: client_1.Prisma.SortOrder.desc,
            },
        });
        res.status(200).json({
            status: "success",
            news,
        });
    });
});
