import { Message } from "../../domain/entities";
import { Timeline } from "../../domain/entities/timeline";
import { DateProvider } from "../providers/date.provider";
import { MessageRepository } from "../repositories/message.repository";
import { UserFollowersRepository } from "../repositories/user-followers.repository";

export type MessagesWall = {
  author: string;
  publishedAgo: string;
  text: string;
}[];
export class ViewMessagesWallOfUserUseCase {
  constructor(
    private messageRepository: MessageRepository,
    private userFollowersRepository: UserFollowersRepository,
    private dateProvider: DateProvider
  ) {}

  private get now() {
    return this.dateProvider.getCurrentDate();
  }
  async handle(user: string): Promise<MessagesWall> {
    const wallMessages = await this._getUserAndFolloweesMessages(user);

    const timeline = new Timeline(wallMessages, this.now);

    return timeline.data;
  }

  private async _getUserAndFolloweesMessages(user: string) {
    const userMessagesPromise =
      this.messageRepository.getAllMessagesOfUser(user);

    const allFolloweesMessagesPromise = this._getAllFolloweesMessages(user);

    const allMessages = (
      await Promise.all([userMessagesPromise, allFolloweesMessagesPromise])
    ).flat();
    return allMessages;
  }

  private async _getAllFolloweesMessages(user: string): Promise<Message[]> {
    const followeeList = await this.userFollowersRepository.getUserFollowees(
      user
    );
    const allFolloweesMessages = (
      await Promise.all(
        followeeList.map((followee) =>
          this.messageRepository.getAllMessagesOfUser(followee)
        )
      )
    ).flat();

    return allFolloweesMessages;
  }
}
