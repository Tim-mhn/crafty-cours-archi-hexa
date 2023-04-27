import { MessageText } from "../models/message-text";

export type MessageProps = {
  id: string;
  text: string;
  author: string;
  publishedAt: Date;
};
export class Message {
  private constructor(
    private _id: string,
    private _text: MessageText,
    private _author: string,
    private _publishedAt: Date
  ) {}

  public get id() {
    return this._id;
  }

  public get text() {
    return this._text.value;
  }

  public get author() {
    return this._author;
  }

  public get publishedAt() {
    return this._publishedAt;
  }

  public editText(text: string) {
    this._text = MessageText.of(text);
  }

  static fromProps({ author, id, publishedAt, text }: MessageProps) {
    return new Message(id, MessageText.of(text), author, publishedAt);
  }

  get data() {
    return {
      id: this.id,
      text: this.text,
      author: this.author,
      publishedAt: this.publishedAt,
    };
  }
}
