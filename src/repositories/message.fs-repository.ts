/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { MessageRepository } from "./message.repository";
import { Message, MessageProps } from "../entities";

export type FileSystemMessage = Record<keyof MessageProps, string>;
export class FileSystemMessageRepository implements MessageRepository {
  constructor(private customFilename?: string) {}
  private filename() {
    if (this.customFilename) return this.customFilename;
    const filename = join(__dirname, "messages.json");
    return filename;
  }
  async saveMessage(message: Message): Promise<void> {
    const allMessages = await this._getAllMessages();
    allMessages.push(message);
    await this._saveAllMessages(allMessages);
  }

  private async _saveAllMessages(messages: Message[]): Promise<void> {
    const fileSystemMessages = messages.map((m) => ({
      author: m.author,
      id: m.id,
      text: m.text,
      publishedAt: m.publishedAt,
    }));
    await writeFile(this.filename(), JSON.stringify(fileSystemMessages));
  }

  async getAllMessagesOfUser(user: string) {
    const allMessages = await this._getAllMessages();
    return allMessages.filter((m) => m.author === user);
  }

  async getMessageById(messageId: string): Promise<Message> {
    const allMessages = await this._getAllMessages();
    return allMessages.find((m) => m.id === messageId);
  }

  private async _getAllMessages(): Promise<Message[]> {
    const fsMessages =
      await this._getFileContentOrEmptyArrayStringIfMissingFile();

    return fsMessages.map((fsMessage) =>
      this._mapFileSystemMessageToMessage(fsMessage)
    );
  }

  private async _getFileContentOrEmptyArrayStringIfMissingFile(): Promise<
    FileSystemMessage[]
  > {
    try {
      const stringifiedMessages = await readFile(this.filename(), {
        encoding: "utf-8",
      });
      return JSON.parse(stringifiedMessages);
    } catch (err) {
      console.log("No messages file. Return an empty array of messages");
      return [];
    }
  }

  private _mapFileSystemMessageToMessage({
    author,
    id,
    publishedAt: publishedAtString,
    text,
  }: FileSystemMessage): Message {
    return Message.fromProps({
      author,
      id,
      text,
      publishedAt: new Date(publishedAtString),
    });
  }
}
