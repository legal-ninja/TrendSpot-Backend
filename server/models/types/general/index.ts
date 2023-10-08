export interface Email {
  subject: string;
  body: string;
  send_to: string;
  SENT_FROM: string;
  REPLY_TO: string;
}

export interface resetSuccessType {
  username: string | undefined;
  browser: string;
  OS: string;
}

export interface BecomeAuthorEmail {
  firstName: string;
  lastName: string;
  url: string;
}

export interface PushNotification {
  token: string;
  title: string;
  body: string;
  sound?: any;
  categoryId?: string;
  data?: Object;
}
