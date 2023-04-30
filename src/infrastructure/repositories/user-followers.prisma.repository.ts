import { PrismaClient } from "@prisma/client";
import { UserFollowersRepository } from "../../application/repositories/user-followers.repository";

export class PrismaUserFollowersRepository implements UserFollowersRepository {
  constructor(private prismaClient: PrismaClient) {}
  async getUserFollowees(user: string): Promise<string[]> {
    const { follows } = await this.prismaClient.user.findFirstOrThrow({
      where: {
        name: user,
      },
      select: {
        follows: true,
      },
    });

    return follows.map((f) => f.name);
  }
  async setUserFollowees({
    user,
    followees,
  }: {
    user: string;
    followees: string[];
  }): Promise<void> {
    const data = [user, ...followees].map((name) => ({
      name,
    }));

    const createMissingUsers = this.prismaClient.user.createMany({
      data: data,
      skipDuplicates: true,
    });

    const setListOfFollowees = this.prismaClient.user.update({
      where: {
        name: user,
      },
      data: {
        follows: {
          set: followees.map((followeeName) => ({ name: followeeName })),
        },
      },
    });

    await this.prismaClient.$transaction([
      createMissingUsers,
      setListOfFollowees,
    ]);
  }
}
