import { TimelineMessage } from "../entities";
import { MessageRepository } from "../repositories/message.repository";
import { DateProvider } from "../use-cases/post-message.use-case";

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
    return allMessages.map((m) => ({
      text: m.text,
      id: m.id,
      publishedAgo: computePublishedAgoLabel({
        currentDate: this.now(),
        messagePublishedAt: m.publishedAt,
      }),
    }));
  }
}

function computePublishedAgoLabel({
  currentDate,
  messagePublishedAt,
}: {
  currentDate: Date;
  messagePublishedAt: Date;
}): string {
  const roundedMinutesDiff = getRoundedMinutesDifferenceBetweenDates({
    from: messagePublishedAt,
    to: currentDate,
  });
  if (roundedMinutesDiff == 0) return "now";

  return `${roundedMinutesDiff} ${pluralize({
    word: "minute",
    count: roundedMinutesDiff,
  })} ago`;
}

function pluralize({ count, word }: { count: number; word: string }) {
  if (count > 1) return `${word}s`;
  return word;
}

function getRoundedMinutesDifferenceBetweenDates({
  from,
  to,
}: {
  from: Date;
  to: Date;
}) {
  const MIN_IN_SECONDS = 60;
  const SECOND_IN_MS = 1000;
  const minutesDiff =
    (to.getTime() - from.getTime()) / SECOND_IN_MS / MIN_IN_SECONDS;
  return Math.floor(minutesDiff);
}
