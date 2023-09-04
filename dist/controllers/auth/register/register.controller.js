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
exports.register = void 0;
const bcryptjs_1 = require("bcryptjs");
const async_handler_1 = __importDefault(require("../../../helpers/async.handler"));
const global_error_1 = require("../../../helpers/global.error");
const prisma_client_1 = __importDefault(require("../../../lib/prisma.client"));
const generate_token_1 = require("../../../helpers/generate.token");
const welcome_email_1 = require("../../../views/welcome.email");
const email_service_1 = __importDefault(require("../../../services/email.service"));
exports.register = (0, async_handler_1.default)(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { firstName, lastName, email, password, isAdmin, avatar } = req.body;
        let missingFields = [];
        let bodyObject = {
            firstName,
            lastName,
            email,
            password,
        };
        for (let field in bodyObject) {
            if (!(field in req.body) || !req.body[field])
                missingFields.push(field);
        }
        const isMissingFieldsOne = missingFields.length === 1;
        const concatenatedMissingFields = missingFields.join(", ");
        if (missingFields.length > 0)
            return next(new global_error_1.AppError(`user ${concatenatedMissingFields} ${isMissingFieldsOne ? "is" : "are"} required`, 400));
        const userExists = yield prisma_client_1.default.user.findFirst({ where: { email } });
        if (userExists)
            return next(new global_error_1.AppError("Email already in use", 400));
        const salt = (0, bcryptjs_1.genSaltSync)(10);
        const passwordHash = (0, bcryptjs_1.hashSync)(password, salt);
        const newUser = yield prisma_client_1.default.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: passwordHash,
                avatar: avatar || "",
                bio: "",
                isAdmin,
            },
        });
        const token = (0, generate_token_1.generateToken)(newUser.id);
        const { password: _password } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
        const userInfo = Object.assign({ token }, userWithoutPassword);
        const subject = `Welcome Onboard, ${newUser.firstName}!`;
        const send_to = newUser.email;
        const sent_from = process.env.EMAIL_USER;
        const reply_to = process.env.REPLY_TO;
        const body = (0, welcome_email_1.welcome)(newUser.lastName);
        try {
            (0, email_service_1.default)({ subject, body, send_to, sent_from, reply_to });
            const token = (0, generate_token_1.generateToken)(newUser.id);
            const { password: _password } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
            const userInfo = Object.assign({ token }, userWithoutPassword);
            res.status(200).json({
                status: "success",
                user: userInfo,
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
