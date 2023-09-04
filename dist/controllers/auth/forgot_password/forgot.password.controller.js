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
exports.forgotPassword = void 0;
const async_handler_1 = __importDefault(require("../../../helpers/async.handler"));
const global_error_1 = require("../../../helpers/global.error");
const prisma_client_1 = __importDefault(require("../../../lib/prisma.client"));
const crypto_1 = require("crypto");
const reset_email_1 = require("../../../views/reset.email");
const email_service_1 = __importDefault(require("../../../services/email.service"));
exports.forgotPassword = (0, async_handler_1.default)(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email } = req.body;
        if (!email)
            return next(new global_error_1.AppError("Please provide the email associated with your account", 400));
        const user = yield prisma_client_1.default.user.findFirst({ where: { email } });
        if (!user)
            return next(new global_error_1.AppError("The email provided is not registered", 404));
        const resetToken = (0, crypto_1.randomBytes)(32).toString("hex") + user.id;
        const hashedToken = (0, crypto_1.createHash)("sha256").update(resetToken).digest("hex");
        yield prisma_client_1.default.token.create({
            data: {
                token: hashedToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });
        const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;
        const subject = "Password Reset Request";
        const send_to = email;
        const SENT_FROM = process.env.EMAIL_USER;
        const REPLY_TO = process.env.REPLY_TO;
        const body = (0, reset_email_1.passwordResetEmail)({
            username: user.firstName,
            url: resetUrl,
        });
        try {
            (0, email_service_1.default)({ subject, body, send_to, SENT_FROM, REPLY_TO });
            res.status(200).json({
                status: "success",
                token: resetToken,
                message: `An email has been sent to ${email} with instructions
        to reset your password. Please ensure to check your spam folder, Click on 'Report as not spam' so you can keep getting our emails in your inbox`,
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
