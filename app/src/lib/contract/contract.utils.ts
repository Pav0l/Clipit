import { BigNumber } from "ethers";

export const getTokenIdsFromEvents = (transferOrApprovalEvents: { tokenId: BigNumber }[]) => {
  return transferOrApprovalEvents?.map(event => event.tokenId);
}
