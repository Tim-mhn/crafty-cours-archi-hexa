import { UserFollowees } from "../../domain/models/user-followees";
import { UserFollowersRepository } from "../repositories/user-followers.repository";

export type FollowUserCommand = {
  user: string;
  userToFollow: string;
};

export class FollowUserUseCase {
  constructor(private userFollowersRepository: UserFollowersRepository) {}
  async handle({ user, userToFollow }: FollowUserCommand) {
    const followees = await this.userFollowersRepository.getUserFollowees(user);
    console.log("followees = ", followees);
    const userFollowees = new UserFollowees(followees);
    userFollowees.addFollowee(userToFollow);

    await this.userFollowersRepository.setUserFollowees({
      user,
      followees: userFollowees.value,
    });
  }
}
