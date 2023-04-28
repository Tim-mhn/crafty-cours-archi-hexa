import { MessageRepository } from "../repositories/message.repository";

export type EditMessageCommand = {
  messageId: string;
  text: string;
};
export class EditMessageUseCase {
  constructor(private messageRepository: MessageRepository) {}
  async handle({ messageId, text }: EditMessageCommand) {
    const message = await this.messageRepository.getMessageById(messageId);
    message.editText(text);
    await this.messageRepository.saveMessage(message);
  }
}
