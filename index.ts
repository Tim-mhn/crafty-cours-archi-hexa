#!/usr/bin/env node
import { Command } from "commander";
import {
  DateProvider,
  PostMessageCommand,
  PostMessageUseCase,
} from "./post-message.use-case";
import { FileSystemMessageRepository } from "./repositories/message.fs-repository";

const program = new Command();

const messageRepository = new FileSystemMessageRepository();
class RealDateProvider implements DateProvider {
  getCurrentDate(): Date {
    return new Date();
  }
}
const postMessageUseCase = new PostMessageUseCase(
  new RealDateProvider(),
  messageRepository
);

program
  .version("1.0.0")
  .description("Social network crafty")
  .addCommand(
    new Command("post")
      .argument("<user>", "current user")
      .argument("<message>", "message")
      .action((user, message) => {
        const postMessageCommand: PostMessageCommand = {
          author: user,
          text: message,
          id: "message-id",
        };

        try {
          postMessageUseCase.handle(postMessageCommand);
          //   console.table([messageRepository.message]);
        } catch (err) {
          console.error("Error :", (err as Error).stack);
        }
      })
  );

async function main() {
  await program.parseAsync();
}

main();
