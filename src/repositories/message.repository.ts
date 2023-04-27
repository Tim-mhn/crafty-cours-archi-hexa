import { Message } from "../entities";
import { EditMessageCommand } from "../use-cases/edit-message.use-case";

export interface MessageRepository {
  saveMessage(message: Message): Promise<void>;
  getAllMessagesOfUser(user: string): Promise<Message[]>;
  editMessageText(editMessageCommand: EditMessageCommand): Promise<void>;
  getMessageById(messageId: string): Promise<Message>;
}
