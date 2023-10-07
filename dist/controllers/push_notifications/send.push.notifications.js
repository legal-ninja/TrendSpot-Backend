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
exports.sendOutPushNotification = void 0;
const async_handler_1 = __importDefault(require("../../helpers/async.handler"));
const push_notification_1 = __importDefault(require("../../services/push.notification"));
const prisma_client_1 = __importDefault(require("../../lib/prisma.client"));
const global_error_1 = require("../../helpers/global.error");
exports.sendOutPushNotification = (0, async_handler_1.default)(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { title, message, firstName, lastName, pushToken, notificationType } = req.body;
        console.log({ pushToken, notificationType });
        if (!message || !title)
            return next(new global_error_1.AppError("Both Title and Message are required", 400));
        if (notificationType === "Single") {
            yield (0, push_notification_1.default)({
                token: pushToken,
                title,
                body: `Hey ${firstName} ${lastName}, ${message}`,
            });
        }
        else {
            const allUsers = yield prisma_client_1.default.user.findMany();
            const usersWithPushToken = allUsers.filter((user) => user.pushToken !== null);
            usersWithPushToken.map((user) => __awaiter(this, void 0, void 0, function* () {
                yield (0, push_notification_1.default)({
                    token: user.pushToken,
                    title,
                    body: `Hey ${user === null || user === void 0 ? void 0 : user.firstName} ${user.lastName}, ${message}`,
                });
            }));
        }
        res.status(200).json({
            status: "success",
            message: notificationType === "Single"
                ? `Push Notification sent to ${firstName} ${lastName}`
                : "Push Notifications sent successfully",
        });
    });
});
