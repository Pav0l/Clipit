import { BigNumber } from "ethers";
import { formatCurrencyAmountToDisplayAmount } from "../currency";

describe("currency", () => {
  it("formatCurrencyAmountToDisplayAmount: formats proper display value", () => {
    // only display 4 digits after .
    expect(formatCurrencyAmountToDisplayAmount("123451234567890", 10)).toEqual("12345.1234");
    expect(formatCurrencyAmountToDisplayAmount("123451234567890", 3)).toEqual("123451234567");
    expect(formatCurrencyAmountToDisplayAmount("123451234567890", 0)).toEqual("123451234567890");
    // default decimals are 18
    expect(formatCurrencyAmountToDisplayAmount("123456789012345678")).toEqual("0.1234");
    expect(formatCurrencyAmountToDisplayAmount("0")).toEqual("0.0");

    // also works with BigNumbers
    expect(formatCurrencyAmountToDisplayAmount(BigNumber.from("123456789012345678"))).toEqual("0.1234");
    // and numbers
    expect(formatCurrencyAmountToDisplayAmount(123451234567890, 3)).toEqual("123451234567");
  });

  it("formatCurrencyAmountToDisplayAmount: throws if number overflows", () => {
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
      formatCurrencyAmountToDisplayAmount(123451234567890123451234567890, 3)
    ).toThrow();
  });

  it("formatCurrencyAmountToDisplayAmount: throws on invalid amount", () => {
    expect(() => formatCurrencyAmountToDisplayAmount("abc", 3)).toThrow();
    expect(() => formatCurrencyAmountToDisplayAmount(undefined as any)).toThrow();
    expect(() => formatCurrencyAmountToDisplayAmount("1,12345", 3)).toThrow();
    expect(() => formatCurrencyAmountToDisplayAmount("1.12345", 3)).toThrow();
  });
});
