import { TimelineMessage } from "../../domain/entities";
import { DateProvider } from "../providers/date.provider";
import { MessageRepository } from "../repositories/message.repository";
import { Timeline } from "../../domain/entities/timeline";
export class ViewUserMessagesTimelineUseCase {
  private now() {
    return this.dateProvider.getCurrentDate();
  }

  constructor(
    private dateProvider: DateProvider,
    private messageRepository: MessageRepository
  ) {}

  async execute(authorName: string): Promise<TimelineMessage[]> {
    const allMessages = await this.messageRepository.getAllMessagesOfUser(
      authorName
    );

    const timeline = new Timeline(allMessages, this.now());
    return timeline.data;
  }
}
