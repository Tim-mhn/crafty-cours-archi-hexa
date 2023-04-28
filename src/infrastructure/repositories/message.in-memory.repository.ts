import { Message } from "../../domain/entities";
import { MessageRepository } from "../../application/repositories/message.repository";

export class InMemoryMessageRepository implements MessageRepository {
  messages: Message[] = [];
  async saveMessage(msg: Message) {
    this.messages.push(msg);
  }

  async getAllMessagesOfUser(user: string) {
    return this.messages.filter((m) => m.author === user);
  }

  async getMessageById(messageId: string) {
    return this.messages.find((m) => m.id === messageId) as Message;
  }
}
