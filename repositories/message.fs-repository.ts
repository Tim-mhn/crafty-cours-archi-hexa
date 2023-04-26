import { writeFile } from "fs/promises";
import { Message, MessageRepository } from "../post-message.use-case";
import { join } from "path";

export class FileSystemMessageRepository implements MessageRepository {
  async saveMessage(message: Message): Promise<void> {
    const filename = join(__dirname, "message.json");
    await writeFile(filename, JSON.stringify(message));
  }
}
