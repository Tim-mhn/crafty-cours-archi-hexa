import { Message } from "../entities";

const DEFAULT_MESSAGE_PROPS: Message = {
  author: "default author",
  text: "default message text",
  id: "default-msg-id",
  publishedAt: new Date("2023-04-27T14:46:44.203Z"),
} as const;

export const messageBuilder = ({
  id,
  author,
  text,
  publishedAt,
} = DEFAULT_MESSAGE_PROPS) => {
  const props = { id, author, text, publishedAt };

  return {
    withId(id: string) {
      return messageBuilder({
        ...props,
        id,
      });
    },
    authoredBy(user: string) {
      return messageBuilder({
        ...props,
        author: user,
      });
    },
    publishedAt(publishedAt: Date) {
      return messageBuilder({
        ...props,
        publishedAt,
      });
    },
    withText(text: string) {
      return messageBuilder({
        ...props,
        text,
      });
    },

    build(): Message {
      return { ...props };
    },
  };
};
