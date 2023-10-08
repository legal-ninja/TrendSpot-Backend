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
exports.markAsread = void 0;
const async_handler_1 = __importDefault(require("../../helpers/async.handler"));
const prisma_client_1 = __importDefault(require("../../lib/prisma.client"));
const global_error_1 = require("../../helpers/global.error");
exports.markAsread = (0, async_handler_1.default)(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { type } = req.query;
        if (!req.params.id)
            return next(new global_error_1.AppError("Please specify Notification Id", 400));
        if (type === "All") {
            yield prisma_client_1.default.notification.updateMany({
                data: {
                    isRead: true,
                },
            });
        }
        else {
            yield prisma_client_1.default.notification.update({
                where: {
                    id: req.params.id,
                },
                data: {
                    isRead: true,
                },
            });
        }
        res.status(200).json({
            status: "success",
            message: type === "All"
                ? "All Notification marked as read."
                : "Notification marked as read.",
        });
    });
});
