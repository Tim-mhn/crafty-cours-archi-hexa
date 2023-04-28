import { Message } from "./message";
import { TimelineMessage } from "../models/timeline-message";

export class Timeline {
  constructor(
    private readonly messages: Message[],
    private readonly now: Date
  ) {}

  public get data(): TimelineMessage[] {
    return this.messages.sort(this.latestMessageFirst).map((m) => ({
      text: m.text,
      author: m.author,
      publishedAgo: this.computePublishedAgoLabel({
        currentDate: this.now,
        messagePublishedAt: m.publishedAt,
      }),
    }));
  }

  private computePublishedAgoLabel({
    currentDate,
    messagePublishedAt,
  }: {
    currentDate: Date;
    messagePublishedAt: Date;
  }): string {
    const roundedMinutesDiff = this.getRoundedMinutesDifferenceBetweenDates({
      from: messagePublishedAt,
      to: currentDate,
    });
    if (roundedMinutesDiff == 0) return "now";

    return `${roundedMinutesDiff} ${this.pluralize({
      word: "minute",
      count: roundedMinutesDiff,
    })} ago`;
  }

  private pluralize({ count, word }: { count: number; word: string }) {
    if (count > 1) return `${word}s`;
    return word;
  }

  private getRoundedMinutesDifferenceBetweenDates({
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

  private latestMessageFirst = (msg1: Message, msg2: Message) =>
    msg2.publishedAt.getTime() - msg1.publishedAt.getTime();
}
