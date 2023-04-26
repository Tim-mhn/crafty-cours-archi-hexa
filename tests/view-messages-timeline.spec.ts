import { InMemoryMessageRepository } from "../repositories/message.in-memory.repository";
import { Message } from "../use-cases/post-message.use-case";
import { ViewUserMessagesTimelineUseCase } from "../use-cases/view-user-messages-timeline.use-case";

describe("View Messages Timeline", () => {
  let testFixture: TestFixture;

  beforeEach(() => {
    testFixture = new TestFixture();
  });
  describe("Feature: the user only sees the messages they posted", () => {
    it("alice should only see the 2 messages she posted", async () => {
      testFixture.givenAllMessagesPostedAre([
        {
          text: "Hello world",
          publishedAt: new Date("2023-04-26T21:00:00.00Z"),
          author: "alice",
          id: "message-1",
        },
        {
          text: "This is bob",
          publishedAt: new Date("2023-04-26T21:05:00.00Z"),
          author: "bob",
          id: "message-2",
        },
        {
          text: "How are you ?",
          publishedAt: new Date("2023-04-26T21:09:00.00Z"),
          author: "alice",
          id: "message-3",
        },
      ]);

      testFixture.givenCurrentDateIs(new Date("2023-04-26T21:10:00.00Z"));

      await testFixture.whenUserSeesMessagesTimeLineOf("alice");

      testFixture.thenMessagesSeenTextAre([
        {
          text: "Hello world",
          id: "message-1",
        },
        {
          text: "How are you ?",
          id: "message-3",
        },
      ]);
    });
  });

  describe("Feature: the 'publishedAgo' label", () => {
    it("should show '1 minute ago' if the message was published 1 minute ago, and '10 minutes' ago if published 10 minutes ago", async () => {
      testFixture.givenAllMessagesPostedAre([
        {
          text: "Hello world",
          publishedAt: new Date("2023-04-26T21:00:00.00Z"),
          author: "alice",
          id: "message-1",
        },
        {
          text: "This is bob",
          publishedAt: new Date("2023-04-26T21:05:00.00Z"),
          author: "bob",
          id: "message-2",
        },
        {
          text: "How are you ?",
          publishedAt: new Date("2023-04-26T21:09:00.00Z"),
          author: "alice",
          id: "message-3",
        },
      ]);

      testFixture.givenCurrentDateIs(new Date("2023-04-26T21:10:00.00Z"));

      await testFixture.whenUserSeesMessagesTimeLineOf("alice");

      testFixture.thenMessagesSeenAreExactly([
        {
          text: "Hello world",
          publishedAgo: "10 minutes ago",
          id: "message-1",
        },
        {
          text: "How are you ?",
          publishedAgo: "1 minute ago",
          id: "message-3",
        },
      ]);
    });

    it("should show 'now' if the message was published less than 1 minute before the current date", async () => {
      testFixture.givenAllMessagesPostedAre([
        {
          text: "hey",
          publishedAt: new Date("2023-04-26T21:09:45.00Z"),
          author: "alice",
          id: "message-1",
        },
      ]);

      testFixture.givenCurrentDateIs(new Date("2023-04-26T21:10:00.00Z"));

      await testFixture.whenUserSeesMessagesTimeLineOf("alice");

      testFixture.thenMessagesSeenAreExactly([
        {
          text: "hey",
          publishedAgo: "now",
          id: "message-1",
        },
      ]);
    });
  });
});

class TestFixture {
  now: Date;

  timelineMessages: { text: string; publishedAgo: string; id: string }[];

  inMemoryMessagesRepository = new InMemoryMessageRepository();

  dateProvider = {
    getCurrentDate: () => this.now,
  };
  viewUserMessagesTimelineUseCase = new ViewUserMessagesTimelineUseCase(
    this.dateProvider,
    this.inMemoryMessagesRepository
  );

  givenCurrentDateIs(currentDate) {
    this.now = currentDate;
  }
  givenAllMessagesPostedAre(messages: Message[]) {
    this.inMemoryMessagesRepository.messages = messages;
  }

  async whenUserSeesMessagesTimeLineOf(user: string) {
    this.timelineMessages = await this.viewUserMessagesTimelineUseCase.execute(
      user
    );
  }
  thenMessagesSeenTextAre(messagesSeen: { text: string; id: string }[]) {
    expect(this.timelineMessages.map(({ text, id }) => ({ text, id }))).toEqual(
      messagesSeen
    );
  }

  thenMessagesSeenAreExactly(
    messagesSeen: {
      text: string;
      publishedAgo: string;
      id: string;
    }[]
  ) {
    expect(this.timelineMessages).toEqual(messagesSeen);
  }
}
