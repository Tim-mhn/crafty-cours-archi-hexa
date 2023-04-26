import { Message } from "../use-cases/post-message.use-case";

export interface MessageRepository {
  saveMessage(message: Message): Promise<void>;
  getAllMessagesOfUser(user: string): Promise<Message[]>;
}
