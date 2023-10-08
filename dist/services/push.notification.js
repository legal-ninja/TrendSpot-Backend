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
Object.defineProperty(exports, "__esModule", { value: true });
const expo_server_sdk_1 = require("expo-server-sdk");
const expo = new expo_server_sdk_1.Expo();
function sendPushNotification({ token, title, body, sound, data, mutableContent, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const pushMessage = {
            to: token,
            sound: sound || "default",
            title,
            body,
            data,
            mutableContent,
        };
        try {
            let ticketChunk = yield expo.sendPushNotificationsAsync([pushMessage]);
            console.log("Push notification sent:", ticketChunk);
            if (ticketChunk)
                return true;
        }
        catch (error) {
            console.error("Error sending push notification:", error);
        }
    });
}
exports.default = sendPushNotification;
