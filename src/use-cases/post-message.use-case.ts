import { Message } from "../entities";
import { MessageRepository } from "../repositories/message.repository";
import { checkTextIsValidOrThrow } from "./text.validator";

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
    checkTextIsValidOrThrow({ text });
    const message: Message = {
      author,
      id,
      text,
      publishedAt: this.dateProvider.getCurrentDate(),
    };
    await this.messageRepository.saveMessage(message);
  }
}
