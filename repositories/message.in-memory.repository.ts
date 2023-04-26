import { Message, MessageRepository } from "../post-message.use-case";

export class InMemoryMessageRepository implements MessageRepository {
  message: Message;
  async saveMessage(msg: Message) {
    this.message = msg;
  }
}
