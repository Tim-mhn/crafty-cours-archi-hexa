import { FollowUserUseCase } from "../application/use-cases/follow-user.use-case";
import { UserIsAlreadyFollowed } from "../domain/models/user-followees";
import { InMemoryUserFollowersRepository } from "../infrastructure/repositories/user-followers.in-memory.repository";

describe("Feature: follow user", () => {
  let fixture: FollowUserTestFixture;

  beforeEach(() => {
    fixture = createFollowUserTestFixture();
  });
  it("when a user follows another user, they are in his list of followees", async () => {
    await fixture.givenUserFollows({
      user: "alice",
      follows: [],
    });

    await fixture.whenUserFollows({
      user: "alice",
      userToFollow: "bob",
    });

    await fixture.thenUserFolloweesAre({
      user: "alice",
      follows: ["bob"],
    });
  });

  it("given alice already follows 2 users, if alice follows bob, then alice must have 3 followees  ", async () => {
    await fixture.givenUserFollows({
      user: "alice",
      follows: ["mike", "tom"],
    });

    await fixture.whenUserFollows({
      user: "alice",
      userToFollow: "bob",
    });

    await fixture.thenUserFolloweesAre({
      user: "alice",
      follows: ["mike", "tom", "bob"],
    });
  });

  it("given alice and bob follow no one, if alice follows mike and bob follows tom, then alice's followees should only be mike", async () => {
    await fixture.givenUserFollows({
      user: "alice",
      follows: [],
    });

    await fixture.givenUserFollows({
      user: "bob",
      follows: [],
    });

    await fixture.whenUserFollows({
      user: "alice",
      userToFollow: "mike",
    });

    await fixture.whenUserFollows({
      user: "bob",
      userToFollow: "tom",
    });

    await fixture.thenUserFolloweesAre({
      user: "alice",
      follows: ["mike"],
    });
  });

  it("given alice already follows bob and mike, she should not be able to re-follow bob ", async () => {
    await fixture.givenUserFollows({
      user: "alice",
      follows: ["bob", "mike"],
    });

    await fixture.whenUserFollows({
      user: "alice",
      userToFollow: "bob",
    });

    await fixture.thenUserFolloweesAre({
      user: "alice",
      follows: ["bob", "mike"],
    });
    fixture.thenShouldThrowError(UserIsAlreadyFollowed);
  });
});

export const createFollowUserTestFixture = () => {
  const inMemoryRepo = new InMemoryUserFollowersRepository();

  const followUserUseCase = new FollowUserUseCase(inMemoryRepo);

  let errorThrown: Error;
  return {
    givenUserFollows: async ({
      user,
      follows,
    }: {
      user: string;
      follows: string[];
    }) => {
      await inMemoryRepo.setUserFollowees({ user, followees: follows });
    },
    whenUserFollows: async ({
      user,
      userToFollow,
    }: {
      user: string;
      userToFollow: string;
    }) => {
      try {
        await followUserUseCase.handle({ user, userToFollow });
      } catch (err) {
        errorThrown = err;
      }
    },
    thenUserFolloweesAre: async ({
      user,
      follows,
    }: {
      user: string;
      follows: string[];
    }) => {
      const userFollowees = await inMemoryRepo.getUserFollowees(user);
      await expect(userFollowees).toEqual(follows);
    },
    thenShouldThrowError(errorClass: new () => Error) {
      expect(errorThrown).toBeInstanceOf(errorClass);
    },
    followersRepository: inMemoryRepo,
  };
};

export type FollowUserTestFixture = ReturnType<
  typeof createFollowUserTestFixture
>;
