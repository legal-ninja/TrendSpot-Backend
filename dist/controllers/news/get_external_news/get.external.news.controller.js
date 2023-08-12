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
exports.getExternalNews = void 0;
const async_handler_1 = __importDefault(require("../../../helpers/async.handler"));
const axios_1 = __importDefault(require("axios"));
exports.getExternalNews = (0, async_handler_1.default)(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = process.env.NEWS_API_KEY;
        const apiUrl = `${process.env.NEWS_API_URL}/top-headlines`;
        const { countryCode } = req.query;
        const { category } = req.query;
        const requestToNewsAPI = yield axios_1.default.get(apiUrl, {
            params: {
                apiKey,
                country: countryCode ? countryCode : "us",
                category: category ? category : "general",
            },
        });
        const news = requestToNewsAPI.data.articles;
        res.status(200).json({
            status: "success",
            results: news.length,
            news,
        });
    });
});
