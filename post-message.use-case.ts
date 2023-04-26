export type Message = {
  id: string;
  text: string;
  author: string;
  publishedAt: Date;
};
export type PostMessageCommand = { id: string; text: string; author: string };
export class MessageTooLong extends Error {}
export class EmptyMessageForbidden extends Error {}

export interface DateProvider {
  getCurrentDate(): Date;
}
export interface MessageRepository {
  saveMessage(message: Message): Promise<void>;
}

const MESSAGE_MAX_LENGTH = 200;
export class PostMessageUseCase {
  constructor(
    private dateProvider: DateProvider,
    private messageRepository: MessageRepository
  ) {}

  async handle({ author, id, text }: PostMessageCommand) {
    this._checkTextIsValid({ text });
    const message: Message = {
      author,
      id,
      text,
      publishedAt: this.dateProvider.getCurrentDate(),
    };
    await this.messageRepository.saveMessage(message);
  }

  private _checkTextIsValid({ text }: { text: string }) {
    if (this._textIsEmpty({ text })) throw new EmptyMessageForbidden();
    if (text.length > MESSAGE_MAX_LENGTH) throw new MessageTooLong();
  }

  private _textIsEmpty({ text }: { text: string }) {
    return text.trim() == "";
  }
}
