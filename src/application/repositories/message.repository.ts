import { Message } from "../../domain/entities";

export interface MessageRepository {
  saveMessage(message: Message): Promise<void>;
  getAllMessagesOfUser(user: string): Promise<Message[]>;
  getMessageById(messageId: string): Promise<Message>;
}
