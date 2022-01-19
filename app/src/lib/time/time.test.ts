import { formatTimestampToCountdown } from "./time";

describe("time", () => {
  it("formatTimestampToCountdown: formats ts prolery", () => {
    let ts = 0;
    expect(formatTimestampToCountdown(ts)).toEqual("ENDED");
    ts = 30;
    expect(formatTimestampToCountdown(ts)).toEqual("0d 00h 00m 30s");
    ts = 60;
    expect(formatTimestampToCountdown(ts)).toEqual("0d 00h 01m 00s");
    ts = 65;
    expect(formatTimestampToCountdown(ts)).toEqual("0d 00h 01m 05s");
    ts = 600;
    expect(formatTimestampToCountdown(ts)).toEqual("0d 00h 10m 00s");
    ts = 60 * 60;
    expect(formatTimestampToCountdown(ts)).toEqual("0d 01h 00m 00s");
    ts = 60 * 60 * 2 + 1200 + 30;
    expect(formatTimestampToCountdown(ts)).toEqual("0d 02h 20m 30s");
    ts = 60 * 60 * 24;
    expect(formatTimestampToCountdown(ts)).toEqual("1d 00h 00m 00s");
    ts = 60 * 60 * 24 * 10;
    expect(formatTimestampToCountdown(ts)).toEqual("10d 00h 00m 00s");
    ts = 60 * 60 * 24 * 100;
    expect(formatTimestampToCountdown(ts)).toEqual("100d 00h 00m 00s");
    ts = -30;
    expect(formatTimestampToCountdown(ts)).toEqual("ENDED");
  });
});
