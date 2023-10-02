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
exports.acceptAuthorRequest = void 0;
const async_handler_1 = __importDefault(require("../../helpers/async.handler"));
const global_error_1 = require("../../helpers/global.error");
const email_service_1 = __importDefault(require("../../services/email.service"));
const prisma_client_1 = __importDefault(require("../../lib/prisma.client"));
const become_author_accepted_email_1 = require("../../views/become.author.accepted.email");
exports.acceptAuthorRequest = (0, async_handler_1.default)(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const userToUpdate = yield prisma_client_1.default.user.findFirst({
            where: { id: req.params.id },
        });
        if (!userToUpdate)
            return next(new global_error_1.AppError("User not found.", 404));
        yield prisma_client_1.default.authorRequest.update({
            where: {
                id: req.params.id,
            },
            data: {
                actionTaken: true,
            },
        });
        yield prisma_client_1.default.user.update({
            where: {
                id: req.params.id,
            },
            data: {
                isAuthor: true,
            },
        });
        const subject = "Update on your request Become An Author on TrendSpot";
        const SENT_FROM = process.env.EMAIL_USER;
        const REPLY_TO = process.env.REPLY_TO;
        const email = userToUpdate.email;
        const body = (0, become_author_accepted_email_1.becomeAuthorAcceptedEmail)(userToUpdate.firstName);
        try {
            (0, email_service_1.default)({ subject, body, send_to: email, SENT_FROM, REPLY_TO });
            res.status(200).json({
                status: "success",
                message: `Your response on this request has been sent to the ${userToUpdate.firstName}.`,
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
