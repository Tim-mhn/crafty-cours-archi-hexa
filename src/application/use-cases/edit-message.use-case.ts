import { MessageTooLong } from "../../domain/errors/post-message.errors";
import { MessageRepository } from "../repositories/message.repository";
import { Err, Ok, Result } from "../result";
export type EditMessageCommand = {
  messageId: string;
  text: string;
};
export class EditMessageUseCase {
  constructor(private messageRepository: MessageRepository) {}
  async handle({
    messageId,
    text,
  }: EditMessageCommand): Promise<Result<void, MessageTooLong>> {
    const message = await this.messageRepository.getMessageById(messageId);
    try {
      message.editText(text);
    } catch (err) {
      return Err.of(err);
    }
    await this.messageRepository.saveMessage(message);

    return Ok.of(undefined);
  }
}
