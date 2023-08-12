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
exports.addNews = void 0;
const async_handler_1 = __importDefault(require("../../../helpers/async.handler"));
const global_error_1 = require("../../../helpers/global.error");
const prisma_client_1 = __importDefault(require("../../../lib/prisma.client"));
const slugify_1 = require("../../../helpers/slugify");
exports.addNews = (0, async_handler_1.default)(function (req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { title, content, image, readTime, category } = req.body;
        let missingFields = [];
        let bodyObject = { title, content, image, readTime, category };
        for (let field in bodyObject) {
            if (!req.body[field])
                missingFields.push(field);
        }
        const isMissingFieldsOne = missingFields.length === 1;
        const concatenatedMissingFields = missingFields.join(", ");
        if (missingFields.length > 0)
            return next(new global_error_1.AppError(`news ${concatenatedMissingFields} ${isMissingFieldsOne ? "is" : "are"} required`, 400));
        const news = yield prisma_client_1.default.news.create({
            data: {
                title,
                content,
                image,
                readTime,
                category,
                slug: (0, slugify_1.slugify)(title),
                authorId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            },
        });
        res.status(200).json({
            status: "success",
            news,
        });
    });
});
