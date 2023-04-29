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
import { FileSystemUserFollowersRepository } from "./src/infrastructure/repositories/user-followers.fs.repository";
import { FollowUserUseCase } from "./src/application/use-cases/follow-user.use-case";
import { ViewMessagesWallOfUserUseCase } from "./src/application/use-cases/view-wall.use-case";

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

const fsUserFollowersRepository = new FileSystemUserFollowersRepository();
const followUserUseCase = new FollowUserUseCase(fsUserFollowersRepository);

const viewUserWallUseCase = new ViewMessagesWallOfUserUseCase(
  messageRepository,
  fsUserFollowersRepository,
  new RealDateProvider()
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
          id: Math.floor(Math.random() * 1e9).toString(),
        };

        try {
          postMessageUseCase.handle(postMessageCommand);
        } catch (err) {
          console.error("Error :", (err as Error).stack);
        }
      })
  )
  .addCommand(
    new Command("view").argument("<user>", "user").action(async (user) => {
      const run = async () => {
        const timeline = await viewUserMessagesTimelineUseCase.execute(
          user as string
        );
        console.table(timeline);
      };

      runAndExitProcessBasedOnError(run);
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

        runAndExitProcessBasedOnError(() =>
          editMessageUseCase.handle(editMessageCommand)
        );
      })
  )
  .addCommand(
    new Command("follow")
      .argument("<user>", "user")
      .argument("<follow>", "user to follow")
      .action(async (user, followee) => {
        runAndExitProcessBasedOnError(() =>
          followUserUseCase.handle({ user, userToFollow: followee })
        );
      })
  )
  .addCommand(
    new Command("wall").argument("<user>", "user").action(async (user) => {
      const run = async () => {
        const userWall = await viewUserWallUseCase.handle(user);
        console.table(userWall);
      };

      runAndExitProcessBasedOnError(run);
    })
  );

async function runAndExitProcessBasedOnError(fn: () => Promise<void>) {
  try {
    await fn();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

async function main() {
  await program.parseAsync();
}

main();
