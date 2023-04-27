import { MessageText } from "../models/message-text";

export type Message = {
  id: string;
  text: MessageText;
  author: string;
  publishedAt: Date;
};
