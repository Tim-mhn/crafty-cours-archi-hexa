import {
  EmptyMessageForbidden,
  MessageTooLong,
} from "../errors/post-message.errors";
const MESSAGE_MAX_LENGTH = 200;

export function checkTextIsValidOrThrow({ text }: { text: string }) {
  if (textIsEmpty({ text })) throw new EmptyMessageForbidden();
  if (text.length > MESSAGE_MAX_LENGTH) throw new MessageTooLong();
}

function textIsEmpty({ text }: { text: string }) {
  return text.trim() == "";
}
