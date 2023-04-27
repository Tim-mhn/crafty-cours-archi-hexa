import { Message } from "../entities";
import {
  EmptyMessageForbidden,
  MessageTooLong,
} from "../errors/post-message.errors";
import { MessageText } from "../models/message-text";
import { InMemoryMessageRepository } from "../repositories/message.in-memory.repository";
import {
  DateProvider,
  PostMessageCommand,
  PostMessageUseCase,
} from "../use-cases/post-message.use-case";

describe("Feature: posting a message", () => {
  let testFixture: ReturnType<typeof createTestFixture>;

  beforeEach(() => {
    testFixture = createTestFixture();
  });
  describe("Rule: a message can contain max 200 characters ", () => {
    it("Alice can post a message on her timeline", async () => {
      testFixture.givenNowIs(new Date("2023-01-19T18:00:00.000Z"));

      const postMessageCommand: PostMessageCommand = {
        author: "alice",
        text: "Hello",
        id: "message-id",
      };
      await testFixture.whenUserPostsMessage(postMessageCommand);

      await testFixture.thenPostedMessageShouldBe({
        id: "message-id",
        text: "Hello",
        author: "alice",
        publishedAt: new Date("2023-01-19T18:00:00.000Z"),
      });
    });

    it("Alice cannot post a message that is strictly more than 200 characters", async () => {
      const testFixture = createTestFixture();

      testFixture.givenNowIs(new Date("2023-01-19T18:00:00.000Z"));

      await testFixture.whenUserPostsMessage({
        id: "message-2",
        text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula \
        eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, \
        nascetur ridiculus mus. Donec qua",
        author: "Alice",
      });

      testFixture.thenShouldThrowError(MessageTooLong);
    });
  });

  describe("Rule: a message cannot be empty", () => {
    it("Alice cannot post a message with an empty text", async () => {
      const testFixture = createTestFixture();

      testFixture.givenNowIs(new Date("2023-01-19T18:00:00.000Z"));

      const message: PostMessageCommand = {
        author: "",
        id: "message-id",
        text: "",
      };
      await testFixture.whenUserPostsMessage(message);

      testFixture.thenShouldThrowError(EmptyMessageForbidden);
    });

    it("Alice cannot post a message with only spaces", async () => {
      const testFixture = createTestFixture();

      testFixture.givenNowIs(new Date("2023-01-19T18:00:00.000Z"));

      const message: PostMessageCommand = {
        author: "",
        id: "message-id",
        text: "             ",
      };

      await testFixture.whenUserPostsMessage(message);

      testFixture.thenShouldThrowError(EmptyMessageForbidden);
    });
  });
});

class StubDateProvider implements DateProvider {
  now: Date;

  getCurrentDate() {
    return this.now;
  }
}

const createTestFixture = () => {
  const stubDateProvider = new StubDateProvider();
  const messageRepo = new InMemoryMessageRepository();
  let thrownError: Error;
  const postMessageUseCase = new PostMessageUseCase(
    stubDateProvider,
    messageRepo
  );

  return {
    thenShouldThrowError: (errorClass: new () => Error) => {
      expect(thrownError).toBeInstanceOf(errorClass);
    },
    thenPostedMessageShouldBe: async (
      _expectedMessage: Omit<Message, "text"> & { text: string }
    ) => {
      const { author, id, publishedAt, text } = _expectedMessage;
      const expectedMessage: Message = {
        author,
        id,
        publishedAt,
        text: MessageText.of(text),
      };

      const message = await messageRepo.getMessageById(expectedMessage.id);
      expect(message).toEqual(expectedMessage);
    },
    givenNowIs: (date: Date) => {
      stubDateProvider.now = date;
    },
    whenUserPostsMessage: async (postMessageCommand: PostMessageCommand) => {
      try {
        await postMessageUseCase.handle(postMessageCommand);
      } catch (err) {
        thrownError = err;
      }
    },
  };
};
