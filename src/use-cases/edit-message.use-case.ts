import { EmptyMessageForbidden } from "../errors/post-message.errors";
import { MessageRepository } from "../repositories/message.repository";
import { checkTextIsValidOrThrow } from "./text.validator";

export type EditMessageCommand = {
  messageId: string;
  text: string;
};
export class EditMessageUseCase {
  constructor(private messageRepository: MessageRepository) {}
  async handle({ messageId, text }: EditMessageCommand) {
    checkTextIsValidOrThrow({ text });
    await this.messageRepository.editMessageText({ messageId, text });
  }
}
