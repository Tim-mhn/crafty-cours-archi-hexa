#!/usr/bin/env node
import { Command } from "commander";
import {
  PostMessageCommand,
  PostMessageUseCase,
} from "./src/application/use-cases/post-message.use-case";
import { FileSystemMessageRepository } from "./src/infrastructure/repositories/message.fs-repository";
import { ViewUserMessagesTimelineUseCase } from "./src/application/use-cases/view-user-messages-timeline.use-case";
import {
  EditMessageCommand,
  EditMessageUseCase,
} from "./src/application/use-cases/edit-message.use-case";
import { DateProvider } from "./src/application/providers/date.provider";

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

const viewUserMessagesTimelineUseCase = new ViewUserMessagesTimelineUseCase(
  new RealDateProvider(),
  messageRepository
);

const editMessageUseCase = new EditMessageUseCase(messageRepository);

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
          id: Math.floor(Math.random() * 1e9).toString(),
        };

        try {
          postMessageUseCase.handle(postMessageCommand);
          //   console.table([messageRepository.message]);
        } catch (err) {
          console.error("Error :", (err as Error).stack);
        }
      })
  )
  .addCommand(
    new Command("view").argument("<user>", "user").action(async (user) => {
      try {
        const timeline = await viewUserMessagesTimelineUseCase.execute(
          user as string
        );
        console.table(timeline);
        process.exit(0);
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    })
  )
  .addCommand(
    new Command("edit")
      .argument("<messageId>", "message id")
      .argument("<text>", "new text")
      .action(async (messageId, text) => {
        const editMessageCommand: EditMessageCommand = {
          messageId,
          text,
        };

        try {
          await editMessageUseCase.handle(editMessageCommand);

          process.exit(0);
        } catch (err) {
          console.error(err);
          process.exit(1);
        }
      })
  );

async function main() {
  await program.parseAsync();
}

main();
