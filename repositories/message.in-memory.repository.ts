import { Message } from "../use-cases/post-message.use-case";
import { MessageRepository } from "./message.repository";

export class InMemoryMessageRepository implements MessageRepository {
  messages: Message[] = [];
  async saveMessage(msg: Message) {
    this.messages.push(msg);
  }

  async getAllMessagesOfUser(user: string) {
    return this.messages.filter((m) => m.author === user);
  }

  getMessageById(messageId: string) {
    return this.messages.find((m) => m.id === messageId);
  }
}
