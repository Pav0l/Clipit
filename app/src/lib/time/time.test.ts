import { formatTimestampToCountdown, calcExpectedEndOfAuction } from "./time";

describe("time", () => {
  it("formatTimestampToCountdown: formats ts properly", () => {
    let ts = 0;
    expect(formatTimestampToCountdown(ts)).toEqual(null);
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
    expect(formatTimestampToCountdown(ts)).toEqual(null);
    ts = NaN;
    expect(formatTimestampToCountdown(ts)).toEqual(null);
  });

  it("calcExpectedEndOfAuction: returns timestamp till the end of auction", () => {
    // unknown inputs from auction
    expect(calcExpectedEndOfAuction()).toEqual(NaN);
    // null expected end
    expect(calcExpectedEndOfAuction(null)).toEqual(NaN);
    // invalid inputs
    expect(calcExpectedEndOfAuction("")).toEqual(NaN);
    expect(calcExpectedEndOfAuction("xxx")).toEqual(NaN);

    const nowPlusHour = Math.floor(Date.now() / 1000) + 3600;
    expect(calcExpectedEndOfAuction(nowPlusHour.toString())).toEqual(3600);
  });
});
