import { BigNumber } from "ethers";

export class Decimal {
  static from = (value: number) => {
    const decimalsInValue = Decimal.countDecimals(value);
    const difference = 18 - decimalsInValue;
    const zeros = BigNumber.from(10).pow(difference);
    const abs = BigNumber.from(`${value.toString().replace(".", "")}`);
    return {
      value: abs.mul(zeros),
    };
  };

  static countDecimals = (value: number): number => {
    if (Math.floor(value) !== value) return value.toString().split(".")[1].length || 0;
    return 0;
  };
}
