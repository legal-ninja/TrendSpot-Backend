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
exports.changePassword = void 0;
const async_handler_1 = __importDefault(require("../../../../helpers/async.handler"));
const global_error_1 = require("../../../../helpers/global.error");
const prisma_client_1 = __importDefault(require("../../../../lib/prisma.client"));
const bcryptjs_1 = require("bcryptjs");
const push_notification_1 = __importDefault(require("../../../../services/push.notification"));
exports.changePassword = (0, async_handler_1.default)(function (req, res, next) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const { oldPassword, newPassword, confirmNewPassword, token } = req.body;
        const currentUser = yield prisma_client_1.default.user.findFirst({
            where: {
                id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            },
        });
        if (!currentUser)
            return next(new global_error_1.AppError("Could not find user", 404));
        if (newPassword !== confirmNewPassword)
            return next(new global_error_1.AppError("New password credentials do not match", 400));
        const passwordIscorrect = yield (0, bcryptjs_1.compare)(oldPassword, currentUser.password);
        if (!passwordIscorrect)
            return next(new global_error_1.AppError("Old password is incorrect", 400));
        const salt = (0, bcryptjs_1.genSaltSync)(10);
        const passwordHash = (0, bcryptjs_1.hashSync)(newPassword, salt);
        yield prisma_client_1.default.user.update({
            where: { id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id },
            data: {
                password: passwordHash,
            },
        });
        yield prisma_client_1.default.activity.create({
            data: {
                description: "updated your account password",
                category: "account",
                action: "update account password",
                userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
            },
        });
        yield (0, push_notification_1.default)({
            token,
            title: "Password Changed",
            body: `Hey ${currentUser.firstName}, Your TrendSpot password has been changed.`,
            data: {
                url: `trendspot://AuthSequence`,
            },
        });
        res.status(200).json({
            status: "success",
            message: "Your password has been updated",
        });
    });
});
