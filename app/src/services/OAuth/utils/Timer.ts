export default class Timer {
  static getEpochTime(): number {
    return Math.floor(Date.now() / 1000);
  }
}
