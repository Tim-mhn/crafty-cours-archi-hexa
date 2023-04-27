import { Message } from "../entities";
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

  async editMessageText({
    messageId,
    text,
  }: {
    messageId: string;
    text: string;
  }): Promise<void> {
    const message = this.getMessageById(messageId);
    message.text = text;
  }
}
