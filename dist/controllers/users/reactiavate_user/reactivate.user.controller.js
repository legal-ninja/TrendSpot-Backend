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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reActivateUser = void 0;
const async_handler_1 = __importDefault(require("../../../helpers/async.handler"));
const global_error_1 = require("../../../helpers/global.error");
const prisma_client_1 = __importDefault(require("../../../lib/prisma.client"));
const push_notification_1 = __importDefault(require("../../../services/push.notification"));
exports.reActivateUser = (0, async_handler_1.default)(function (req, res, next) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const { userId, token } = req.body;
        if (!userId)
            return next(new global_error_1.AppError("Please specify the user id", 404));
        const existingUser = yield prisma_client_1.default.user.findFirst({
            where: {
                id: userId,
            },
        });
        if (!existingUser)
            return next(new global_error_1.AppError("User could not be found", 404));
        if (existingUser.isDeactivatedByAdmin &&
            ((_a = req.user) === null || _a === void 0 ? void 0 : _a.email) !== "trendspot@admin.com") {
            return next(new global_error_1.AppError("This account was deactivated by the super admin. Please file an appeal to get your account reactivated.", 401));
        }
        else if (!existingUser.isDeactivatedByAdmin &&
            ((_b = req.user) === null || _b === void 0 ? void 0 : _b.email) !== existingUser.email) {
            return next(new global_error_1.AppError("This account was deactivated by the user not by an admin. Only the user can reactivate this account.", 401));
        }
        yield prisma_client_1.default.user.update({
            where: {
                id: existingUser.id,
            },
            data: {
                isDeactivated: false,
                isDeactivatedByAdmin: false,
            },
        });
        yield prisma_client_1.default.activity.create({
            data: {
                description: "reactivated your account",
                category: "account",
                action: "reactivate account",
                userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
            },
        });
        yield prisma_client_1.default.notification.create({
            data: {
                description: "Your TrendSpot account has been reactivated! You are back up and running!",
                category: "account",
                userId: (_d = req.user) === null || _d === void 0 ? void 0 : _d.id,
            },
        });
        yield (0, push_notification_1.default)({
            token: token || existingUser.pushToken,
            mutableContent: true,
            title: "Account Reactivated",
            body: `Hey ${existingUser.firstName} ${existingUser.lastName}, Your TrendSpot account has been reactivated! You are back up and running!`,
            data: {
                url: `trendspot://Notifications`,
            },
        });
        const modifiedUser = Object.assign(Object.assign({}, existingUser), { isDeactivated: false, isDeactivatedByAdmin: false });
        const { password } = modifiedUser, userInfo = __rest(modifiedUser, ["password"]);
        res.status(200).json({
            status: "success",
            message: "Account reactivated",
            updatedUser: userInfo,
        });
    });
});
