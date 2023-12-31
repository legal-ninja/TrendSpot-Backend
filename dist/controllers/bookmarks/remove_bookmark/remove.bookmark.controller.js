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
exports.removeFromBookmarks = void 0;
const async_handler_1 = __importDefault(require("../../../helpers/async.handler"));
const prisma_client_1 = __importDefault(require("../../../lib/prisma.client"));
exports.removeFromBookmarks = (0, async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { bookmarkId } = req.params;
    yield prisma_client_1.default.bookmark.delete({
        where: {
            id: bookmarkId,
        },
    });
    yield prisma_client_1.default.activity.create({
        data: {
            description: "removed your bookmark of a news",
            category: "news",
            action: "removed news",
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
        },
    });
    res.status(200).json({
        status: "success",
        message: "Bookmark removed",
    });
}));
