import { writeFile } from "fs/promises";
import { join } from "path";
import { MessageRepository } from "./message.repository";
import { Message } from "../use-cases/post-message.use-case";

export class FileSystemMessageRepository implements MessageRepository {
  async saveMessage(message: Message): Promise<void> {
    const filename = join(__dirname, "message.json");
    await writeFile(filename, JSON.stringify(message));
  }

  async getAllMessagesOfUser(_user: string) {
    return [];
  }
}
