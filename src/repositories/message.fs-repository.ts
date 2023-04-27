/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { MessageRepository } from "./message.repository";
import { Message } from "../entities";
import { EditMessageCommand } from "../use-cases/edit-message.use-case";

type FileSystemMessage = Record<keyof Message, string>;
export class FileSystemMessageRepository implements MessageRepository {
  private filename() {
    const filename = join(__dirname, "messages.json");
    return filename;
  }
  async saveMessage(message: Message): Promise<void> {
    const allMessages = await this._getAllMessages();
    allMessages.push(message);
    this._saveAllMessages(allMessages);
  }

  async editMessageText({
    messageId,
    text,
  }: EditMessageCommand): Promise<void> {
    const allMessages = await this._getAllMessages();
    const messageToEdit = allMessages.find((m) => m.id === messageId);
    messageToEdit.text = text;
    await this._saveAllMessages(allMessages);
  }

  private async _saveAllMessages(messages: Message[]): Promise<void> {
    await writeFile(this.filename(), JSON.stringify(messages));
  }

  async getAllMessagesOfUser(user: string) {
    const allMessages = await this._getAllMessages();
    return allMessages.filter((m) => m.author === user);
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
    return {
      author,
      id,
      text,
      publishedAt: new Date(publishedAtString),
    };
  }
}
