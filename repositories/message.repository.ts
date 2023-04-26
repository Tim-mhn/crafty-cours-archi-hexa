import { Message } from "../entities";

export interface MessageRepository {
  saveMessage(message: Message): Promise<void>;
  getAllMessagesOfUser(user: string): Promise<Message[]>;
}
