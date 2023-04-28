import { DateProvider } from "../application/providers/date.provider";

export class StubDateProvider implements DateProvider {
  now: Date;

  getCurrentDate() {
    return this.now;
  }
}
