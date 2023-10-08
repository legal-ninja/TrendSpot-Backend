import { Expo } from "expo-server-sdk";
import { PushNotification } from "../models/types/general";

const expo = new Expo();

async function sendPushNotification({
  token,
  title,
  body,
  sound,
  data,
  mutableContent,
}: PushNotification) {
  const pushMessage = {
    to: token,
    sound: sound || "default",
    title,
    body,
    data,
    mutableContent,
  };

  try {
    let ticketChunk = await expo.sendPushNotificationsAsync([pushMessage]);
    console.log("Push notification sent:", ticketChunk);
    if (ticketChunk) return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

export default sendPushNotification;
