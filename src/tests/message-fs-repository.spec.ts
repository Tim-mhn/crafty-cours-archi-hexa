import { writeFile, readFile } from "fs/promises";
import * as path from "path";
import {
  FileSystemMessage,
  FileSystemMessageRepository,
} from "../repositories/message.fs-repository";
import { messageBuilder } from "./message.builder";

const testMessageFilePath = path.join(__dirname, "./messages-test.json");

describe("FileSystemMessageRepository", () => {
  let fsMessageRepo: FileSystemMessageRepository;

  beforeEach(async () => {
    fsMessageRepo = new FileSystemMessageRepository(testMessageFilePath);
    try {
      await writeFile(testMessageFilePath, JSON.stringify([]));
    } catch (err) {
      console.error(err);
    }
  });

  //   afterAll(async () => {
  //     try {
  //       await writeFile(testMessageFilePath, JSON.stringify([]));
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   });

  describe("saveMessage", () => {
    it("should save a message in the file system", async () => {
      await fsMessageRepo.saveMessage(
        messageBuilder()
          .withId("message-1")
          .withText("hello")
          .authoredBy("bob")
          .publishedAt(new Date("2020-04-01T23:00:00.00Z"))
          .build()
      );

      const fsMessagesString = await readFile(testMessageFilePath, {
        encoding: "utf-8",
      });

      const fsMessages = JSON.parse(fsMessagesString);

      const expectedFsMessages: FileSystemMessage[] = [
        {
          id: "message-1",
          author: "bob",
          text: "hello",
          publishedAt: "2020-04-01T23:00:00.000Z",
        },
      ];
      expect(fsMessages).toEqual(expectedFsMessages);
    });
  });

  describe("getMessageById", () => {
    it("getMessageById returns the right message by id", async () => {
      await writeFile(
        testMessageFilePath,
        JSON.stringify([
          {
            id: "message-1",
            author: "alice",
            text: "hello",
            publishedAt: "2020-04-01T23:00:00.000Z",
          },
          {
            id: "message-2",
            author: "bob",
            text: "hey !",
            publishedAt: "2020-04-01T23:00:00.000Z",
          },
        ])
      );

      const message = await fsMessageRepo.getMessageById("message-2");

      expect(message).toEqual(
        messageBuilder()
          .withId("message-2")
          .authoredBy("bob")
          .withText("hey !")
          .publishedAt(new Date("2020-04-01T23:00:00.000Z"))
          .build()
      );
    });
  });
});
