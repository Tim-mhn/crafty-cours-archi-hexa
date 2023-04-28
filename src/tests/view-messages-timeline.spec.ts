import { Message, TimelineMessage } from "../domain/entities";
import { InMemoryMessageRepository } from "../infrastructure/repositories/message.in-memory.repository";
import { ViewUserMessagesTimelineUseCase } from "../application/use-cases/view-user-messages-timeline.use-case";
import { messageBuilder } from "./message.builder";

describe("View Messages Timeline", () => {
  let testFixture: ViewMessageTestFixture;

  beforeEach(() => {
    testFixture = new ViewMessageTestFixture();
  });
  describe("Feature: the user only sees the messages they posted", () => {
    it("alice should only see the 2 messages she posted", async () => {
      testFixture.givenAllMessagesPostedAre([
        messageBuilder()
          .withId("message-1")
          .withText("Hello world")
          .authoredBy("alice")
          .build(),
        messageBuilder()
          .withId("message-2")
          .withText("this is bob")
          .authoredBy("bob")
          .build(),

        messageBuilder()
          .withId("message-3")
          .withText("How are you ?")
          .authoredBy("alice")
          .build(),
      ]);

      testFixture.givenCurrentDateIs(new Date("2023-04-26T21:10:00.00Z"));

      await testFixture.whenUserSeesMessagesTimeLineOf("alice");

      testFixture.thenMessagesSeenTextAre([
        {
          text: "Hello world",
          author: "alice",
        },
        {
          text: "How are you ?",
          author: "alice",
        },
      ]);
    });
  });

  describe("Feature: the 'publishedAgo' label", () => {
    it("should show '1 minute ago' if the message was published 1 minute ago, and '10 minutes' ago if published 10 minutes ago", async () => {
      testFixture
        .givenAllMessagesPostedAre([
          messageBuilder()
            .authoredBy("alice")
            .publishedAt(new Date("2023-04-26T21:00:00.00Z"))
            .withId("message-1")
            .withText("Hello world")
            .build(),
          messageBuilder()
            .authoredBy("bob")
            .publishedAt(new Date("2023-04-26T21:05:00.00Z"))
            .withId("message-2")
            .withText("hey this is bob !")
            .build(),
          messageBuilder()
            .authoredBy("alice")
            .publishedAt(new Date("2023-04-26T21:09:00.00Z"))
            .withId("message-3")
            .withText("How are you ?")
            .build(),
        ])
        .givenCurrentDateIs(new Date("2023-04-26T21:10:00.00Z"));

      await testFixture.whenUserSeesMessagesTimeLineOf("alice");

      testFixture.thenMessagesSeenAreExactly([
        {
          text: "How are you ?",
          publishedAgo: "1 minute ago",
          author: "alice",
        },
        {
          text: "Hello world",
          publishedAgo: "10 minutes ago",
          author: "alice",
        },
      ]);
    });

    it("should show 'now' if the message was published less than 1 minute before the current date", async () => {
      testFixture
        .givenAllMessagesPostedAre([
          messageBuilder()
            .authoredBy("alice")
            .publishedAt(new Date("2023-04-26T21:09:45.00Z"))
            .withId("message-1")
            .withText("hey")
            .build(),
        ])
        .givenCurrentDateIs(new Date("2023-04-26T21:10:00.00Z"));

      await testFixture.whenUserSeesMessagesTimeLineOf("alice");

      testFixture.thenMessagesSeenAreExactly([
        {
          text: "hey",
          publishedAgo: "now",
          author: "alice",
        },
      ]);
    });
  });
});

export class ViewMessageTestFixture {
  now: Date;

  timelineMessages: TimelineMessage[];

  inMemoryMessagesRepository = new InMemoryMessageRepository();

  public get messageRepository() {
    return this.inMemoryMessagesRepository;
  }

  dateProvider = {
    getCurrentDate: () => this.now,
  };
  viewUserMessagesTimelineUseCase = new ViewUserMessagesTimelineUseCase(
    this.dateProvider,
    this.inMemoryMessagesRepository
  );

  givenCurrentDateIs(currentDate) {
    this.now = currentDate;
    return this;
  }
  givenAllMessagesPostedAre(messages: Message[]) {
    this.inMemoryMessagesRepository.messages = messages;
    return this;
  }

  async whenUserSeesMessagesTimeLineOf(user: string) {
    this.timelineMessages = await this.viewUserMessagesTimelineUseCase.execute(
      user
    );
  }
  thenMessagesSeenTextAre(messagesSeen: { text: string; author: string }[]) {
    expect(
      this.timelineMessages.map(({ text, author }) => ({ text, author }))
    ).toEqual(messagesSeen);
  }

  thenMessagesSeenAreExactly(messagesSeen: TimelineMessage[]) {
    expect(this.timelineMessages).toEqual(messagesSeen);
  }
}
