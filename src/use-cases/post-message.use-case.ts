import { Message } from "../entities";
import { MessageText } from "../models/message-text";
import { MessageRepository } from "../repositories/message.repository";

export type PostMessageCommand = { id: string; text: string; author: string };

export interface DateProvider {
  getCurrentDate(): Date;
}

export class PostMessageUseCase {
  constructor(
    private dateProvider: DateProvider,
    private messageRepository: MessageRepository
  ) {}

  async handle({ author, id, text }: PostMessageCommand) {
    const message: Message = {
      author,
      id,
      text: MessageText.of(text),
      publishedAt: this.dateProvider.getCurrentDate(),
    };
    await this.messageRepository.saveMessage(message);
  }
}
