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
exports.updateUser = exports.updateMe = void 0;
const async_handler_1 = __importDefault(require("../../../helpers/async.handler"));
const global_error_1 = require("../../../helpers/global.error");
const prisma_client_1 = __importDefault(require("../../../lib/prisma.client"));
const generate_token_1 = require("../../../helpers/generate.token");
exports.updateMe = (0, async_handler_1.default)(function (req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { firstName, lastName, avatar, bio, isAdmin } = req.body;
        if (!firstName && !lastName && !avatar && !bio && !isAdmin)
            return next(new global_error_1.AppError("Please provide at least one credential you want to update", 400));
        const existingUser = yield prisma_client_1.default.user.findFirst({
            where: {
                id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            },
        });
        if (!existingUser)
            return next(new global_error_1.AppError("User could not be found", 404));
        const user = yield prisma_client_1.default.user.update({
            where: {
                id: existingUser.id,
            },
            data: {
                firstName: firstName || existingUser.firstName,
                lastName: lastName || existingUser.lastName,
                avatar: avatar || existingUser.avatar,
                bio: bio || existingUser.bio,
                isAdmin: isAdmin || existingUser.isAdmin,
            },
        });
        const token = (0, generate_token_1.generateToken)(existingUser.id);
        const { password: _password } = user, userWithoutPassword = __rest(user, ["password"]);
        const updatedUser = Object.assign({ token }, userWithoutPassword);
        res.status(200).json({
            status: "success",
            updatedUser,
        });
    });
});
exports.updateUser = (0, async_handler_1.default)(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { firstName, lastName, avatar, bio, isDeactivated, isDeactivatedByAdmin, } = req.body;
        if (isDeactivated || isDeactivatedByAdmin)
            return next(new global_error_1.AppError("Invalid operation. User activation status cannot be updated from this route.", 400));
        if (!firstName && !lastName && !avatar && !bio)
            return next(new global_error_1.AppError("Please provide at least one credential you want to update", 400));
        console.log(req.params.userId);
        const existingUser = yield prisma_client_1.default.user.findFirst({
            where: {
                id: req.params.userId,
            },
        });
        if (!existingUser)
            return next(new global_error_1.AppError("User could not be found", 404));
        const updatedUser = yield prisma_client_1.default.user.update({
            where: {
                id: existingUser.id,
            },
            data: {
                firstName: firstName || existingUser.firstName,
                lastName: lastName || existingUser.lastName,
                avatar: avatar || existingUser.avatar,
                bio: bio || existingUser.bio,
            },
        });
        res.status(200).json({
            status: "success",
            message: "User updated successfully",
            updatedUser,
        });
    });
});
