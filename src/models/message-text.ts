import {
  EmptyMessageForbidden,
  MessageTooLong,
} from "../errors/post-message.errors";
const MESSAGE_MAX_LENGTH = 200;

export class MessageText {
  private constructor(readonly value: string) {}

  static of(value: string) {
    this.checkTextIsValidOrThrow(value);
    return new MessageText(value);
  }

  static checkTextIsValidOrThrow(text: string) {
    if (this.textIsEmpty({ text })) throw new EmptyMessageForbidden();
    if (text.length > MESSAGE_MAX_LENGTH) throw new MessageTooLong();
  }

  static textIsEmpty({ text }: { text: string }) {
    return text.trim() == "";
  }
}
