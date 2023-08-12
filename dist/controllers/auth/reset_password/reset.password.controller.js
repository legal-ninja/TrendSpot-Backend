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
exports.resetPassword = void 0;
const async_handler_1 = __importDefault(require("../../../helpers/async.handler"));
const global_error_1 = require("../../../helpers/global.error");
const crypto_1 = require("crypto");
const prisma_client_1 = __importDefault(require("../../../lib/prisma.client"));
const bcryptjs_1 = require("bcryptjs");
const ua_parser_js_1 = __importDefault(require("ua-parser-js"));
exports.resetPassword = (0, async_handler_1.default)(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { newPassword, confirmNewPassword } = req.body;
        const { token } = req.params;
        if (!newPassword || !confirmNewPassword)
            return next(new global_error_1.AppError("Please provide all password credentials", 400));
        if (newPassword !== confirmNewPassword)
            return next(new global_error_1.AppError("New password credentials do not match", 400));
        const decryptedToken = (0, crypto_1.createHash)("sha256").update(token).digest("hex");
        const existingToken = yield prisma_client_1.default.token.findFirst({
            where: {
                token: decryptedToken,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
        if (!existingToken)
            return next(new global_error_1.AppError("Invalid or expired token", 400));
        const user = yield prisma_client_1.default.user.findFirst({
            where: { id: existingToken === null || existingToken === void 0 ? void 0 : existingToken.userId },
        });
        if (user === null || user === void 0 ? void 0 : user.isDeactivated) {
            let errorMessage;
            user.isDeactivatedByAdmin
                ? (errorMessage =
                    "Your account has been deactivated by the admin. Please file an appeal through our contact channels")
                : (errorMessage =
                    "Your account is currently deactivated, reactivate your account to continue");
            return next(new global_error_1.AppError(errorMessage, 400));
        }
        const salt = (0, bcryptjs_1.genSaltSync)(10);
        const passwordHash = (0, bcryptjs_1.hashSync)(newPassword, salt);
        yield prisma_client_1.default.user.update({
            where: {
                id: user === null || user === void 0 ? void 0 : user.id,
            },
            data: {
                password: passwordHash,
            },
        });
        yield prisma_client_1.default.token.delete({
            where: {
                id: existingToken === null || existingToken === void 0 ? void 0 : existingToken.id,
            },
        });
        const userAgent = (0, ua_parser_js_1.default)(req.headers["user-agent"]);
        const browser = userAgent.browser.name || "Not detected";
        const OS = `${userAgent.os.name || "Not detected"} (${userAgent.os.version || "Not detected"})`;
        const subject = `${user === null || user === void 0 ? void 0 : user.firstName}, Your password was successfully reset`;
        const send_to = user === null || user === void 0 ? void 0 : user.email;
        const sent_from = process.env.EMAIL_USER;
        const reply_to = process.env.REPLY_TO;
        // const body = resetSuccess({
        //   username: user?.lastName,
        //   browser,
        //   OS,
        // });
        try {
            // sendEmail({ subject, body, send_to, sent_from, reply_to });
            res.status(200).json({
                status: "success",
                message: `Password reset successful!`,
            });
        }
        catch (error) {
            res.status(500).json({
                status: "fail",
                message: `Email not sent. Please try again.`,
            });
        }
    });
});
