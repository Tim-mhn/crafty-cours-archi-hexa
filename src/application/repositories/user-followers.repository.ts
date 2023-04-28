export interface UserFollowersRepository {
  getUserFollowees(user: string): Promise<string[]>;
  setUserFollowees({
    user,
    followees,
  }: {
    user: string;
    followees: string[];
  }): Promise<void>;
}
