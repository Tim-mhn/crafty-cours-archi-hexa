import { MessageRepository } from "../application/repositories/message.repository";
import { UserFollowersRepository } from "../application/repositories/user-followers.repository";
import {
  MessagesWall,
  ViewMessagesWallOfUserUseCase,
} from "../application/use-cases/view-wall.use-case";
import {
  FollowUserTestFixture,
  createFollowUserTestFixture,
} from "./follow-user.spec";
import { messageBuilder } from "./message.builder";
import { StubDateProvider } from "./stub.date-provider";
import { ViewMessageTestFixture } from "./view-messages-timeline.spec";

describe("Feature: view the 'wall' of a user: all his messages and those of people he has followed", () => {
  let fixture: ViewWallTestFixture;
  let messageFixture: ViewMessageTestFixture;
  let followUserFixture: FollowUserTestFixture;

  beforeEach(() => {
    messageFixture = new ViewMessageTestFixture();

    followUserFixture = createFollowUserTestFixture();
    fixture = new ViewWallTestFixture(
      followUserFixture.followersRepository,
      messageFixture.messageRepository
    );
  });
  it("if alice has followed bob and mike, her wall will have all her messages and those of bob and mike", async () => {
    await followUserFixture.givenUserFollows({
      user: "alice",
      follows: ["bob", "mike"],
    });

    fixture.givenCurrentDateIs(new Date("2023-04-28T10:00:00Z"));

    await messageFixture.givenAllMessagesPostedAre([
      messageBuilder()
        .authoredBy("bob")
        .withText("hello")
        .publishedAt(new Date("2023-04-28T09:50:00Z"))
        .build(),
      messageBuilder()
        .authoredBy("alice")
        .withText("this is alice")
        .publishedAt(new Date("2023-04-28T09:48:00Z"))
        .build(),
      messageBuilder()
        .authoredBy("mike")
        .withText("I like to chat")
        .publishedAt(new Date("2023-04-28T09:45:00Z"))
        .build(),
    ]);

    await fixture.whenUserSeesWallOf("alice");

    fixture.thenWallShouldBe([
      {
        author: "bob",
        text: "hello",
        publishedAgo: "10 minutes ago",
      },
      {
        author: "alice",
        text: "this is alice",
        publishedAgo: "12 minutes ago",
      },
      {
        author: "mike",
        text: "I like to chat",
        publishedAgo: "15 minutes ago",
      },
    ]);
  });
});

class ViewWallTestFixture {
  constructor(
    private followersRepository: UserFollowersRepository,
    private messageRepository: MessageRepository
  ) {}
  wall: MessagesWall;

  dateProvider = new StubDateProvider();

  viewWallOfUserUseCase = new ViewMessagesWallOfUserUseCase(
    this.messageRepository,
    this.followersRepository,
    this.dateProvider
  );

  givenCurrentDateIs(date: Date) {
    this.dateProvider.now = date;
  }

  async whenUserSeesWallOf(user: string) {
    this.wall = await this.viewWallOfUserUseCase.handle(user);
  }

  thenWallShouldBe(expectedWall: MessagesWall) {
    expect(this.wall).toEqual(expectedWall);
  }
}
