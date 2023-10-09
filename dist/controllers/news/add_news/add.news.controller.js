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
const push_notification_1 = __importDefault(require("../../../services/push.notification"));
const publish_request_1 = require("../../../views/publish.request");
const email_service_1 = __importDefault(require("../../../services/email.service"));
exports.addNews = (0, async_handler_1.default)(function (req, res, next) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    return __awaiter(this, void 0, void 0, function* () {
        const { title, content, image, readTime, category, token, fromPublishRequest, } = req.body;
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
                status: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.isAdmin) ? "published" : "draft",
                isAccepted: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.isAdmin) ? true : false,
                slug: (0, slugify_1.slugify)(title),
                authorId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
            },
        });
        ((_d = req.user) === null || _d === void 0 ? void 0 : _d.isAdmin)
            ? yield prisma_client_1.default.activity.create({
                data: {
                    description: "published a news",
                    category: "news",
                    action: "add",
                    userId: (_e = req.user) === null || _e === void 0 ? void 0 : _e.id,
                },
            })
            : yield prisma_client_1.default.activity.create({
                data: {
                    description: "requested to publish a news",
                    category: "news",
                    action: "add",
                    userId: (_f = req.user) === null || _f === void 0 ? void 0 : _f.id,
                    newsId: news.id,
                },
            });
        if ((_g = req.user) === null || _g === void 0 ? void 0 : _g.isAdmin) {
            yield prisma_client_1.default.notification.create({
                data: {
                    description: "Your news has been published!",
                    category: "news",
                    userId: (_h = req.user) === null || _h === void 0 ? void 0 : _h.id,
                    newsId: news.id,
                },
            });
        }
        else {
            yield prisma_client_1.default.notification.create({
                data: {
                    description: "Your news has been sent to the admins for a review. We would keep in touch!",
                    category: "news",
                    userId: (_j = req.user) === null || _j === void 0 ? void 0 : _j.id,
                },
            });
        }
        ((_k = req.user) === null || _k === void 0 ? void 0 : _k.isAdmin)
            ? yield (0, push_notification_1.default)({
                token,
                title: "News Published",
                body: `Hey ${(_l = req.user) === null || _l === void 0 ? void 0 : _l.firstName}, Your news has been published!`,
                data: {
                    url: "",
                },
            })
            : yield (0, push_notification_1.default)({
                token,
                title: "News Publication",
                body: `Hey ${(_m = req.user) === null || _m === void 0 ? void 0 : _m.firstName}, Your news has been sent to the admins for a review. We would keep in touch!`,
                data: {
                    url: "trendspot://Notifications",
                },
            });
        const adminEmails = [process.env.ADMIN_EMAIL_ONE];
        const subject = "News Publication Request";
        const SENT_FROM = process.env.EMAIL_USER;
        const REPLY_TO = process.env.REPLY_TO;
        const body = (0, publish_request_1.publishRequestEmail)({
            firstName: (_o = req.user) === null || _o === void 0 ? void 0 : _o.firstName,
            lastName: (_p = req.user) === null || _p === void 0 ? void 0 : _p.lastName,
            url: "https://trend-spot-admin.vercel.app/notifications",
        });
        adminEmails.map((email) => {
            var _a;
            try {
                (0, email_service_1.default)({ subject, body, send_to: email, SENT_FROM, REPLY_TO });
                ((_a = req.user) === null || _a === void 0 ? void 0 : _a.isAdmin)
                    ? res.status(200).json({
                        status: "success",
                        news,
                    })
                    : res.status(200).json({
                        status: "success",
                        message: `Your news has been sent to the admins for a review. We would keep in touch!`,
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
