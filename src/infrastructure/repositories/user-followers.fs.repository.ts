import { join } from "path";
import { UserFollowersRepository } from "../../application/repositories/user-followers.repository";
import { readFile, writeFile } from "fs/promises";

type UserFollowersData = Record<string, string[]>;
export class FileSystemUserFollowersRepository
  implements UserFollowersRepository
{
  constructor(private customFilename?: string) {}

  private get filename() {
    if (this.customFilename) return this.customFilename;
    const filename = join(__dirname, "user-followers.json");
    return filename;
  }

  async getUserFollowees(user: string): Promise<string[]> {
    const usersFollowersData = await this._getData();
    return usersFollowersData[user] || [];
  }
  async setUserFollowees({
    user,
    followees,
  }: {
    user: string;
    followees: string[];
  }): Promise<void> {
    const userFollowersData = await this._getData();
    // console.log(userFollowersData);
    userFollowersData[user] = followees;
    console.log(userFollowersData);

    await this._saveData(userFollowersData);
  }

  private async _getData(): Promise<UserFollowersData> {
    return await this._getDataFromFileOrCreateEmptyFile();
  }

  private async _getDataFromFileOrCreateEmptyFile() {
    try {
      const stringifiedData = await readFile(this.filename, {
        encoding: "utf-8",
      });
      return JSON.parse(stringifiedData);
    } catch (err) {
      console.error(err);
      await writeFile(this.filename, JSON.stringify({}));
      return {};
    }
  }

  private async _saveData(data: UserFollowersData) {
    await writeFile(this.filename, JSON.stringify(data));
  }
}
