export class UserIsAlreadyFollowed extends Error {}

export class UserFollowees {
  constructor(readonly value: string[] = []) {}

  addFollowee(newFollowee: string) {
    this._checkUserIsNotAlreadyFollowed(newFollowee);
    this.value?.push(newFollowee);
  }

  private _checkUserIsNotAlreadyFollowed(newFollowee: string) {
    if (this.value.includes(newFollowee)) throw new UserIsAlreadyFollowed();
  }
}
