import { PrismaClient } from "@prisma/client";
import { PrismaUserFollowersRepository } from "../infrastructure/repositories/user-followers.prisma.repository";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "testcontainers";
import { promisify } from "util";
import { exec } from "child_process";
const asyncExec = promisify(exec);

describe("PrismaUserFollowersRepository", () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;
  let repository: PrismaUserFollowersRepository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();

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
    repository = new PrismaUserFollowersRepository(prismaClient);
    await prismaClient.user.deleteMany();
  });

  afterAll(async () => {
    await container.stop();
    await prismaClient.$disconnect();
  });

  describe("setUserFollowees", () => {
    it("should create the users if they do not already exist", async () => {
      await repository.setUserFollowees({
        user: "tim",
        followees: ["bob", "martin"],
      });

      await repository.setUserFollowees({
        user: "bob",
        followees: ["tim"],
      });

      const users = await prismaClient.user.findMany();

      const usersNames = users.map((u) => u.name);

      expect(usersNames).toEqual(["tim", "bob", "martin"]);
    });

    it("should correctly follow users and not double count", async () => {
      await repository.setUserFollowees({
        user: "tim",
        followees: ["bob", "martin"],
      });

      await repository.setUserFollowees({
        user: "tim",
        followees: ["bob", "mike"],
      });

      const timFollowees = await prismaClient.user.findFirstOrThrow({
        where: {
          name: "tim",
        },
        select: {
          follows: true,
        },
      });

      const timFolloweesNames = timFollowees.follows.map((u) => u.name);

      expect(timFolloweesNames).toEqual(["bob", "mike"]);
    });
  });

  describe("getUserFollowees", () => {
    it("given tim has followed mike and bob, it should return ['mike', 'bob']", async () => {
      await repository.setUserFollowees({
        user: "tim",
        followees: ["mike", "bob"],
      });

      const followees = await repository.getUserFollowees("tim");

      expect(followees).toEqual(["mike", "bob"]);
    });
  });
});
