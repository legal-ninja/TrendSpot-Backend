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
exports.signin = void 0;
const async_handler_1 = __importDefault(require("../../../helpers/async.handler"));
const global_error_1 = require("../../../helpers/global.error");
const prisma_client_1 = __importDefault(require("../../../lib/prisma.client"));
const bcryptjs_1 = require("bcryptjs");
const generate_token_1 = require("../../../helpers/generate.token");
exports.signin = (0, async_handler_1.default)(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        let missingFields = [];
        let bodyObject = { email, password };
        for (let field in bodyObject) {
            if (!req.body[field])
                missingFields.push(field);
        }
        const isMissingFieldsOne = missingFields.length === 1;
        const concatenatedMissingFields = missingFields.join(", ");
        if (missingFields.length > 0)
            return next(new global_error_1.AppError(`user ${concatenatedMissingFields} ${isMissingFieldsOne ? "is" : "are"} required`, 400));
        const user = yield prisma_client_1.default.user.findFirst({ where: { email } });
        if (!user)
            return next(new global_error_1.AppError("Invalid credentials provided", 400));
        const passwordIscorrect = yield (0, bcryptjs_1.compare)(password, user.password);
        if (!passwordIscorrect)
            return next(new global_error_1.AppError("Invalid credentials provided", 400));
        const token = (0, generate_token_1.generateToken)(user.id);
        const { password: _password } = user, userWithoutPassword = __rest(user, ["password"]);
        const userInfo = Object.assign({ token }, userWithoutPassword);
        yield prisma_client_1.default.activity.create({
            data: {
                description: "signed in to your account",
                category: "auth",
                action: "sign in",
                userId: user === null || user === void 0 ? void 0 : user.id,
            },
        });
        res.status(200).json({
            status: "success",
            user: userInfo,
        });
    });
});
