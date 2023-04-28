import * as path from "path";
import { FileSystemUserFollowersRepository } from "../infrastructure/repositories/user-followers.fs.repository";
import { writeFile, readFile } from "fs/promises";
const testFilePath = path.join(__dirname, "./user-followers-test.json");

describe("FileSystemUserFollowersRepository", () => {
  let repo: FileSystemUserFollowersRepository;
  beforeEach(async () => {
    repo = new FileSystemUserFollowersRepository(testFilePath);
    try {
      await writeFile(testFilePath, JSON.stringify({}));
    } catch (err) {
      console.error(err);
    }
  });

  describe("setUserFollowees", () => {
    it("should save the followees in the file system", async () => {
      await repo.setUserFollowees({
        user: "alice",
        followees: ["bob", "mike"],
      });

      const followeesDataString = await readFile(testFilePath, {
        encoding: "utf-8",
      });

      const followeesData = JSON.parse(followeesDataString);

      expect(followeesData).toEqual({
        alice: ["bob", "mike"],
      });
    });
  });

  describe("getUserFollowees", () => {
    it("should retrieve the list of followees from the file system", async () => {
      await writeFile(
        testFilePath,
        JSON.stringify({
          alice: ["tom", "sean"],
        })
      );
      const aliceFollowees = await repo.getUserFollowees("alice");

      expect(aliceFollowees).toEqual(["tom", "sean"]);
    });
  });
});
