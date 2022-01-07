import { Decimal } from "./decimal";

function decValToStr(num: number) {
  return Decimal.from(num).value.toString();
}
describe("decimal", () => {

  it("counts decimals in value", () => {
    // no decimals
    expect(Decimal.countDecimals(1)).toEqual(0);
    expect(Decimal.countDecimals(11)).toEqual(0);
    expect(Decimal.countDecimals(222)).toEqual(0);
    expect(Decimal.countDecimals(3333)).toEqual(0);

    // with decimals
    expect(Decimal.countDecimals(1.0)).toEqual(0);
    expect(Decimal.countDecimals(1.00000000)).toEqual(0);
    expect(Decimal.countDecimals(1.1)).toEqual(1);
    expect(Decimal.countDecimals(1.10000000)).toEqual(1);
    expect(Decimal.countDecimals(1.00000001)).toEqual(8);
  });

  it("creates a `BidShare` decimal value", () => {
    expect(decValToStr(1.1)).toEqual("1100000000000000000");
    expect(decValToStr(98)).toEqual("98000000000000000000");
    expect(decValToStr(100)).toEqual("100000000000000000000");
  });
});
