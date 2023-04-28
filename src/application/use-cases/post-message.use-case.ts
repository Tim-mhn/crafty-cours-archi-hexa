import { Message } from "../../domain/entities";
import { DateProvider } from "../providers/date.provider";
import { MessageRepository } from "../repositories/message.repository";

export type PostMessageCommand = { id: string; text: string; author: string };

export class PostMessageUseCase {
  constructor(
    private dateProvider: DateProvider,
    private messageRepository: MessageRepository
  ) {}

  async handle({ author, id, text }: PostMessageCommand) {
    const message = Message.fromProps({
      author,
      id,
      text,
      publishedAt: this.dateProvider.getCurrentDate(),
    });
    await this.messageRepository.saveMessage(message);
  }
}
