import { log } from "@graphprotocol/graph-ts";
import { Clip } from "../generated/schema";
import {
  Approval,
  ApprovalForAll,
  TokenMetadataURIUpdated,
  TokenURIUpdated,
  Transfer,
  ClipIt
} from "../generated/ClipIt/ClipIt";
import {
  findOrCreateUser,
  createURIUpdate,
  createTransfer,
  createClip,
  fetchClipBidShares,
  zeroAddress
} from "./utils";

const CONTENT = "Content";
const METADATA = "Metadata";

export function handleApproval(event: Approval): void {
  const owner = event.params.owner.toHexString();
  const tokenId = event.params.tokenId.toString();
  const approved = event.params.approved.toHexString();

  log.info("[handleApproval] tokenId: {}, owner: {}, approved: {}", [
    tokenId,
    owner,
    approved
  ]);

  const clip = Clip.load(tokenId);
  if (clip == null) {
    log.error("[handleApproval] missing CLIP for tokenId: {}", [tokenId]);
    return;
  }

  if (approved == zeroAddress) {
    clip.approved = null;
  } else {
    const approvedUser = findOrCreateUser(approved);
    clip.approved = approvedUser.id;
  }

  clip.save();
  log.info("[handleApproval] done for tokenId: {}, owner: {}, approved: {}", [
    tokenId,
    owner,
    approved
  ]);
}

export function handleApprovalForAll(event: ApprovalForAll): void {
  const ownerAddr = event.params.owner.toHexString();
  const operatorAddr = event.params.operator.toHexString();
  const approved = event.params.approved;

  log.info("[handleApprovalForAll] owner: {}, operator: {}, approved: {}", [
    ownerAddr,
    operatorAddr,
    approved.toString()
  ]);

  const owner = findOrCreateUser(ownerAddr);
  const operator = findOrCreateUser(operatorAddr);

  if (approved == true) {
    if (owner.authorizedUsers == null) {
      owner.authorizedUsers = [operator.id];
    } else {
      owner.authorizedUsers = owner.authorizedUsers!.concat([operator.id]);
    }
  } else {
    // if authorizedUsers array is null, no-op
    if (owner.authorizedUsers == null) {
      return;
    }

    let index = owner.authorizedUsers!.indexOf(operator.id);
    let copyAuthorizedUsers = owner.authorizedUsers;
    copyAuthorizedUsers!.splice(index, 1);
    owner.authorizedUsers = copyAuthorizedUsers;
  }

  owner.save();
  log.info(
    "[handleApprovalForAll] done for owner: {}, operator: {}, approved: {}",
    [ownerAddr, operatorAddr, approved.toString()]
  );
}

export function handleTokenMetadataURIUpdated(
  event: TokenMetadataURIUpdated
): void {
  let tokenId = event.params._tokenId.toString();

  log.info("[handleTokenMetadataURIUpdated] tokenId: {}", [tokenId]);

  let clip = Clip.load(tokenId);
  if (clip == null) {
    log.error("[handleTokenMetadataURIUpdated] missing CLIP for tokenId: {}", [
      tokenId
    ]);
    return;
  }

  let updater = findOrCreateUser(event.params.owner.toHexString());
  let uriUpdateId = tokenId
    .concat("-")
    .concat(event.transaction.hash.toHexString())
    .concat("-")
    .concat(event.transactionLogIndex.toString());

  createURIUpdate(
    uriUpdateId,
    event.transaction.hash.toHexString(),
    clip as Clip,
    METADATA,
    clip.metadataURI,
    event.params._uri,
    updater.id,
    clip.owner,
    event.block.timestamp,
    event.block.number
  );

  clip.metadataURI = event.params._uri;
  clip.save();
  log.info("[handleTokenMetadataURIUpdated] done for tokenId: {}", [tokenId]);
}

export function handleTokenURIUpdated(event: TokenURIUpdated): void {
  let tokenId = event.params._tokenId.toString();

  log.info("[handleTokenURIUpdated] tokenId: {}", [tokenId]);

  let clip = Clip.load(tokenId);
  if (clip == null) {
    log.error("[handleTokenURIUpdated] missing CLIP for tokenId: {}", [
      tokenId
    ]);
    return;
  }

  let updater = findOrCreateUser(event.params.owner.toHexString());
  let uriUpdateId = tokenId
    .concat("-")
    .concat(event.transaction.hash.toHexString())
    .concat("-")
    .concat(event.transactionLogIndex.toString());

  createURIUpdate(
    uriUpdateId,
    event.transaction.hash.toHexString(),
    clip as Clip,
    CONTENT,
    clip.contentURI,
    event.params._uri,
    updater.id,
    clip.owner,
    event.block.timestamp,
    event.block.number
  );

  clip.contentURI = event.params._uri;
  clip.save();
  log.info("[handleTokenURIUpdated] done for tokenId: {}", [tokenId]);
}

export function handleTransfer(event: Transfer): void {
  const fromAddr = event.params.from.toHexString();
  const toAddr = event.params.to.toHexString();
  const tokenId = event.params.tokenId.toString();

  log.info("[handleTransfer] from: {}, to: {}, tokenId: {}", [
    fromAddr,
    toAddr,
    tokenId
  ]);

  const toUser = findOrCreateUser(toAddr);
  const fromUser = findOrCreateUser(fromAddr);

  // mint
  if (fromUser.id == zeroAddress) {
    handleMint(event);
    return;
  }

  const clip = Clip.load(tokenId);
  if (clip == null) {
    log.error("[handleTransfer] missing CLIP for tokenId: {}", [tokenId]);
    return;
  }

  // burn
  if (toUser.id == zeroAddress) {
    clip.prevOwner = zeroAddress;
    clip.burnedAtTimeStamp = event.block.timestamp;
    clip.burnedAtBlockNumber = event.block.number;
  }

  clip.owner = toUser.id;
  clip.approved = null;
  clip.save();

  const transferId = tokenId
    .concat("-")
    .concat(event.transaction.hash.toHexString())
    .concat("-")
    .concat(event.transactionLogIndex.toString());

  createTransfer(
    transferId,
    event.transaction.hash.toHexString(),
    clip as Clip,
    fromUser,
    toUser,
    event.block.timestamp,
    event.block.number
  );

  log.info("[handleTransfer] done. from: {}, to: {}, tokenId: {}", [
    fromAddr,
    toAddr,
    tokenId
  ]);
}

function handleMint(event: Transfer): void {
  log.info("[handleMint]", []);

  const creator = findOrCreateUser(event.params.to.toHexString());
  const zeroUser = findOrCreateUser(zeroAddress);
  const tokenId = event.params.tokenId;

  const clipContract = ClipIt.bind(event.address);
  const contentURI = clipContract.tokenURI(tokenId);
  const metadataURI = clipContract.tokenMetadataURI(tokenId);

  const contentHash = clipContract.tokenContentHashes(tokenId);
  const metadataHash = clipContract.tokenMetadataHashes(tokenId);

  const bidShares = fetchClipBidShares(tokenId, event.address);

  const clip = createClip(
    tokenId.toString(),
    event.transaction.hash.toHexString(),
    creator,
    creator,
    creator,
    contentURI,
    contentHash,
    metadataURI,
    metadataHash,
    bidShares.creator,
    bidShares.owner,
    event.block.timestamp,
    event.block.number
  );

  const transferId = tokenId
    .toString()
    .concat("-")
    .concat(event.transaction.hash.toHexString())
    .concat("-")
    .concat(event.transactionLogIndex.toString());

  createTransfer(
    transferId,
    event.transaction.hash.toHexString(),
    clip,
    zeroUser,
    creator,
    event.block.timestamp,
    event.block.number
  );

  log.info("[handleMint] done", []);
}
