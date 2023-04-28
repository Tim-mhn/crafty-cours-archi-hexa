import { UserFollowersRepository } from "../../application/repositories/user-followers.repository";

export class InMemoryUserFollowersRepository
  implements UserFollowersRepository
{
  private userFolloweesMap = new Map<string, string[]>();

  async getUserFollowees(user: string): Promise<string[]> {
    return this.userFolloweesMap.get(user) || [];
  }
  async setUserFollowees({
    user,
    followees,
  }: {
    user: string;
    followees: string[];
  }): Promise<void> {
    this.userFolloweesMap.set(user, followees);
  }
}
