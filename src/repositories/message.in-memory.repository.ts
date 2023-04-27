import { Message } from "../entities";
import { MessageText } from "../models/message-text";
import { MessageRepository } from "./message.repository";

export class InMemoryMessageRepository implements MessageRepository {
  messages: Message[] = [];
  async saveMessage(msg: Message) {
    this.messages.push(msg);
  }

  async getAllMessagesOfUser(user: string) {
    return this.messages.filter((m) => m.author === user);
  }

  async getMessageById(messageId: string) {
    return this.messages.find((m) => m.id === messageId);
  }

  async editMessageText({
    messageId,
    text,
  }: {
    messageId: string;
    text: string;
  }): Promise<void> {
    const message = await this.getMessageById(messageId);
    message.text = MessageText.of(text);
  }
}
