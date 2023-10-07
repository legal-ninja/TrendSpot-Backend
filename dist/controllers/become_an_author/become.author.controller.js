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
exports.becomeAnAuthor = void 0;
const async_handler_1 = __importDefault(require("../../helpers/async.handler"));
const global_error_1 = require("../../helpers/global.error");
const become_author_email_1 = require("../../views/become.author.email");
const email_service_1 = __importDefault(require("../../services/email.service"));
const prisma_client_1 = __importDefault(require("../../lib/prisma.client"));
exports.becomeAnAuthor = (0, async_handler_1.default)(function (req, res, next) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        const userIsAdmin = (_a = req.user) === null || _a === void 0 ? void 0 : _a.isAdmin;
        if (userIsAdmin)
            return next(new global_error_1.AppError("Admins cannot request to become an author", 403));
        if ((_b = req.user) === null || _b === void 0 ? void 0 : _b.isAuthor)
            return next(new global_error_1.AppError("You are already an author", 403));
        const previousRequests = yield prisma_client_1.default.authorRequest.findMany({
            where: {
                userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
            },
        });
        const unansweredRequests = previousRequests.filter((request) => request.actionTaken === false);
        if (unansweredRequests.length > 0)
            return next(new global_error_1.AppError("You have raised a request that has not been responded to yet, Please wait till you get a response.", 403));
        yield prisma_client_1.default.authorRequest.create({
            data: {
                userId: (_d = req.user) === null || _d === void 0 ? void 0 : _d.id,
            },
        });
        const adminEmails = [process.env.ADMIN_EMAIL_ONE];
        const subject = "Become An Author Request";
        const SENT_FROM = process.env.EMAIL_USER;
        const REPLY_TO = process.env.REPLY_TO;
        const body = (0, become_author_email_1.becomeAuthorEmail)({
            firstName: (_e = req.user) === null || _e === void 0 ? void 0 : _e.firstName,
            lastName: (_f = req.user) === null || _f === void 0 ? void 0 : _f.lastName,
            url: "https://trend-spot-admin.vercel.app/notifications",
        });
        adminEmails.map((email) => {
            try {
                (0, email_service_1.default)({ subject, body, send_to: email, SENT_FROM, REPLY_TO });
                res.status(200).json({
                    status: "success",
                    message: `Your request to become an author has been sent to the Admins. We would get back to you when the Admins respond to your request.`,
                });
            }
            catch (error) {
                res.status(500).json({
                    status: "fail",
                    message: `Something went wrong. Please try again.`,
                });
            }
        });
    });
});
