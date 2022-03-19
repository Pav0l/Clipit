import { truncate } from "./truncate";

describe("truncate", function () {
  it("truncates a string to specified len", () => {
    const str = "1234567890";
    expect(truncate(str, 3)).toEqual("123...");
    expect(truncate(str, 7)).toEqual("1234567...");
    expect(truncate(str, 0)).toEqual("...");
    expect(truncate(str, str.length)).toEqual(str);
    expect(truncate(str, str.length * 2)).toEqual(str);
  });
});
