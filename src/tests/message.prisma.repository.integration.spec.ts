import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "testcontainers";
import { promisify } from "util";
import { PrismaMessageRepository } from "../infrastructure/repositories/message.prisma.repository";
import { messageBuilder } from "../tests/message.builder";
const asyncExec = promisify(exec);

describe("PrismaMessageRepository ", () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;
  let repository: PrismaMessageRepository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      //   .withDatabase("crafty-test")
      //   .withUser("crafty-test")
      //   .withPassword("crafty-test")
      //   .withExposedPorts(5432)
      .start();

    // const databaseUri = `postgresql://crafty-test:crafty-test@${container.getHost()}:${container.getMappedPort(
    //   5432
    // )}/crafty-test?schema=public`;

    const databaseUri = container.getConnectionUri();

    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUri,
        },
      },
    });

    await asyncExec(`DATABASE_URL=${databaseUri} npx prisma migrate deploy`);

    await prismaClient.$connect();
  });

  beforeEach(async () => {
    repository = new PrismaMessageRepository(prismaClient);
    await prismaClient.message.deleteMany();
  });

  afterAll(async () => {
    await container.stop();
    await prismaClient.$disconnect();
  });

  describe("saveMessage", () => {
    it("should save a message in the database", async () => {
      const message = messageBuilder()
        .authoredBy("tim")
        .withId("message-id-1")
        .withText("hello")
        .publishedAt(new Date("2023-04-01T10:50:00.00Z"))
        .build();

      await repository.saveMessage(message);

      const dbMessage = await prismaClient.message.findFirstOrThrow({
        where: {
          id: message.id,
        },
        select: {
          author: {
            select: {
              name: true,
            },
          },
          id: true,
          publishedAt: true,
          text: true,
        },
      });

      expect(dbMessage).toEqual({
        id: "message-id-1",
        author: {
          name: "tim",
        },
        text: "hello",
        publishedAt: new Date("2023-04-01T10:50:00.00Z"),
      });
    });

    it("should update an existing message", async () => {
      const bobMessageBuilder = messageBuilder()
        .authoredBy("bob")
        .withId("message-id-2")
        .withText("hello tim")
        .publishedAt(new Date("2023-04-15T10:50:00.00Z"));

      await repository.saveMessage(bobMessageBuilder.build());

      await repository.saveMessage(
        bobMessageBuilder.withText("hello tim !!!").build()
      );

      const dbMessage = await prismaClient.message.findFirstOrThrow({
        where: {
          id: "message-id-2",
        },
        select: {
          author: {
            select: {
              name: true,
            },
          },
          id: true,
          publishedAt: true,
          text: true,
        },
      });

      expect(dbMessage).toEqual({
        id: "message-id-2",
        author: {
          name: "bob",
        },
        text: "hello tim !!!",
        publishedAt: new Date("2023-04-15T10:50:00.00Z"),
      });
    });
  });

  describe("getMessageById", () => {
    it("should return the message", async () => {
      const message = messageBuilder()
        .authoredBy("tim")
        .withId("message-id-3")
        .withText("how are you")
        .publishedAt(new Date("2023-04-01T10:50:00.00Z"))
        .build();

      await repository.saveMessage(message);

      const returnedMessage = await repository.getMessageById("message-id-3");

      expect(returnedMessage).toEqual(message);
    });
  });

  describe("getAllMessagesOfUser", () => {
    it("should return all the messages posted by tim, sorted by last published first", async () => {
      const timMessageBuilder = messageBuilder().authoredBy("tim");

      const messages = [
        timMessageBuilder
          .withId("message-id-1")
          .withText("hello")
          .publishedAt(new Date("2023-04-01T10:54:00.00Z"))
          .build(),
        timMessageBuilder
          .withId("message-id-2")
          .withText("how are you")
          .publishedAt(new Date("2023-04-01T10:52:00.00Z"))
          .build(),
        timMessageBuilder
          .withId("message-id-3")
          .withText("i am good")
          .publishedAt(new Date("2023-04-01T10:50:00.00Z"))
          .build(),
      ];
      await repository.saveMessage(messages[0]);

      await repository.saveMessage(messages[1]);

      await repository.saveMessage(messages[2]);

      const retrievedMessages = await repository.getAllMessagesOfUser("tim");

      expect(retrievedMessages).toEqual(messages);
    });
  });
});
