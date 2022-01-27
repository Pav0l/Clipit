import { BigNumberish, utils } from "ethers";

export function formatCurrencyAmountToDisplayAmount(amount: BigNumberish, decimals?: number | null): string {
  if (decimals === null) {
    decimals = undefined;
  }

  const formatedAmount = utils.formatUnits(amount, decimals);
  // handle float amounts
  const idxOfDot = formatedAmount.indexOf(".");
  // no dot -> no float -> just return
  if (idxOfDot === -1) return formatedAmount;
  // number has more than 6 digits, just return it without decimals
  if (idxOfDot > 6) return formatedAmount.substring(0, idxOfDot);
  // return up to 4 deimals
  return formatedAmount.substring(0, idxOfDot + 5);
}
