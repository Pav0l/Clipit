import {
  AskCreated,
  AskRemoved,
  BidCreated,
  BidFinalized,
  BidRemoved,
  BidShareUpdated,
} from '../generated/Market/Market'
import { BigInt, store, log } from '@graphprotocol/graph-ts'
import { Ask, Bid, Clip, Transfer } from '../generated/schema'
import {
  createAsk,
  createBid,
  createInactiveAsk,
  createInactiveBid,
  findOrCreateCurrency,
  findOrCreateUser,
  zeroAddress,
} from './utils'

const REMOVED = 'Removed'
const FINALIZED = 'Finalized'

/**
 * Handler called when a `BidShareUpdated` Event is emitted on the Market Contract
 * @param event
 */
export function handleBidShareUpdated(event: BidShareUpdated): void {
  const tokenId = event.params.tokenId.toString()
  const bidShares = event.params.bidShares

  log.info('[handleBidShareUpdated] tokenId: {}, bidShares: prevOwner: {}, creator: {}, owner: {}', [tokenId, bidShares.prevOwner.value.toString(), bidShares.creator.value.toString(), bidShares.owner.value.toString()]);

  const clip = Clip.load(tokenId)
  if (clip == null) {
    log.error('[handleBidShareUpdated] missing CLIP for tokenId: {}', [tokenId]);
    return;
  }

  clip.creatorBidShare = bidShares.creator.value
  clip.ownerBidShare = bidShares.owner.value
  clip.prevOwnerBidShare = bidShares.prevOwner.value
  clip.save()

  log.info('[handleBidShareUpdated] done. tokenId: {}, bidShares: prevOwner: {}, creator: {}, owner: {}', [tokenId, bidShares.prevOwner.value.toString(), bidShares.creator.value.toString(), bidShares.owner.value.toString()]);
}

/**
 * Handler called when the `AskCreated` Event is emitted on the Market Contract
 * @param event
 */
export function handleAskCreated(event: AskCreated): void {
  const tokenId = event.params.tokenId.toString();
  const onchainAsk = event.params.ask;

  log.info(`[handleAskCreated] tokenId: {}, currency: {}, amount: {}`, [tokenId, onchainAsk.currency.toHexString(), onchainAsk.amount.toString()]);

  const clip = Clip.load(tokenId)
  if (clip == null) {
    log.error('[handleAskCreated] missing CLIP for tokenId: {}', [tokenId]);
    return;
  }

  const currency = findOrCreateCurrency(onchainAsk.currency.toHexString())
  const askId = clip.id.concat('-').concat(clip.owner)
  const ask = Ask.load(askId)

  if (ask == null) {
    createAsk(
      askId,
      event.transaction.hash.toHexString(),
      onchainAsk.amount,
      currency,
      clip as Clip,
      event.block.timestamp,
      event.block.number
    )
  } else {
    const inactiveAskId = tokenId
      .concat('-')
      .concat(event.transaction.hash.toHexString())
      .concat('-')
      .concat(event.transactionLogIndex.toString())

    // create an inactive ask
    createInactiveAsk(
      inactiveAskId,
      event.transaction.hash.toHexString(),
      clip as Clip,
      REMOVED,
      ask.amount,
      currency,
      ask.owner,
      ask.createdAtTimestamp,
      ask.createdAtBlockNumber,
      event.block.timestamp,
      event.block.number
    )

    // update the fields on the original ask object
    ask.amount = onchainAsk.amount
    ask.currency = currency.id
    ask.createdAtTimestamp = event.block.timestamp
    ask.createdAtBlockNumber = event.block.number
    ask.save();

    log.info(`[handleAskCreated] done tokenId: {}, currency: {}, amount: {}`, [tokenId, onchainAsk.currency.toHexString(), onchainAsk.amount.toString()]);

  }
}

/**
 * Handler called when the `AskRemoved` Event is emitted on the Market Contract
 * @param event
 */
export function handleAskRemoved(event: AskRemoved): void {
  const tokenId = event.params.tokenId.toString()
  const onChainAsk = event.params.ask
  let askId: string

  log.info(`[handleAskRemoved] tokenId: {}, currency: {}, amount: {}`, [tokenId, onChainAsk.currency.toHexString(), onChainAsk.amount.toString()]);

  const zero = BigInt.fromI32(0)
  // asks must be > 0 and evenly split by bidshares
  if (onChainAsk.amount.equals(zero)) {
    askId = zeroAddress
  } else {
    const clip = Clip.load(tokenId)
    if (clip == null) {
      log.error('[handleAskRemoved] missing CLIP for tokenId: {}', [tokenId]);
      return;
    }

    const currency = findOrCreateCurrency(onChainAsk.currency.toHexString())

    askId = tokenId.concat('-').concat(clip.owner)
    const ask = Ask.load(askId)
    if (ask == null) {
      log.error('[handleAskRemoved] missing Ask for tokenId: {} and askId: {}', [tokenId, askId]);
      return;
    }

    const inactiveAskId = tokenId
      .concat('-')
      .concat(event.transaction.hash.toHexString())
      .concat('-')
      .concat(event.transactionLogIndex.toString())

    createInactiveAsk(
      inactiveAskId,
      event.transaction.hash.toHexString(),
      clip as Clip,
      REMOVED,
      ask.amount,
      currency,
      ask.owner,
      ask.createdAtTimestamp,
      ask.createdAtBlockNumber,
      event.block.timestamp,
      event.block.number
    )

    store.remove('Ask', askId);
    log.info(`[handleAskRemoved] done tokenId: {}, currency: {}, amount: {}`, [tokenId, onChainAsk.currency.toHexString(), onChainAsk.amount.toString()]);

  }
}

/**
 * Handler called `BidCreated` Event is emitted on the Market Contract
 * @param event
 */
export function handleBidCreated(event: BidCreated): void {
  const tokenId = event.params.tokenId.toString()
  const clip = Clip.load(tokenId)
  const bid = event.params.bid

  log.info(`[handleBidCreated] tokenId: {}, currency: {}, amount: {}, bidder: {}, recipient: {}, sellOnShare: {}`, [
    tokenId,
    bid.currency.toHexString(),
    bid.amount.toString(),
    bid.bidder.toHexString(),
    bid.recipient.toHexString(),
    bid.sellOnShare.value.toString()
  ]);

  if (clip == null) {
    log.error('[handleBidCreated] missing CLIP for tokenId: {}', [tokenId]);
    return;
  }

  const bidId = clip.id.concat('-').concat(bid.bidder.toHexString())

  const bidder = findOrCreateUser(bid.bidder.toHexString())
  const recipient = findOrCreateUser(bid.recipient.toHexString())
  const currency = findOrCreateCurrency(bid.currency.toHexString())

  createBid(
    bidId,
    event.transaction.hash.toHexString(),
    bid.amount,
    currency,
    bid.sellOnShare.value,
    bidder,
    recipient,
    clip as Clip,
    event.block.timestamp,
    event.block.number
  )

  // Update Currency Liquidity
  currency.liquidity = currency.liquidity.plus(bid.amount)
  currency.save()

  log.info(`[handleBidCreated] done tokenId: {}, currency: {}, amount: {}, bidder: {}, recipient: {}, sellOnShare: {}`, [
    tokenId,
    bid.currency.toHexString(),
    bid.amount.toString(),
    bid.bidder.toHexString(),
    bid.recipient.toHexString(),
    bid.sellOnShare.value.toString()
  ]);
}

/**
 * Handler called when the `BidRemoved` Event is emitted on the Market Contract
 * @param event
 */
export function handleBidRemoved(event: BidRemoved): void {
  const tokenId = event.params.tokenId.toString()
  const clip = Clip.load(tokenId)
  const onChainBid = event.params.bid

  const bidId = tokenId.concat('-').concat(onChainBid.bidder.toHexString());

  log.info(`[handleBidRemoved] tokenId: {}, currency: {}, amount: {}, bidder: {}, recipient: {}, sellOnShare: {}`, [
    tokenId,
    onChainBid.currency.toHexString(),
    onChainBid.amount.toString(),
    onChainBid.bidder.toHexString(),
    onChainBid.recipient.toHexString(),
    onChainBid.sellOnShare.value.toString()
  ]);

  if (clip == null) {
    log.error('[handleBidRemoved] missing CLIP for tokenId: {}', [tokenId]);
    return;
  }

  const bid = Bid.load(bidId)
  if (bid == null) {
    log.error('[handleBidRemoved] missing Bid for tokenId: {} and bidId: {}', [tokenId, bidId]);
    return;
  }

  const inactiveBidId = tokenId
    .concat('-')
    .concat(event.transaction.hash.toHexString())
    .concat('-')
    .concat(event.transactionLogIndex.toString())
  const bidder = findOrCreateUser(onChainBid.bidder.toHexString())
  const recipient = findOrCreateUser(onChainBid.recipient.toHexString())
  const currency = findOrCreateCurrency(onChainBid.currency.toHexString())

  // Create Inactive Bid
  createInactiveBid(
    inactiveBidId,
    event.transaction.hash.toHexString(),
    REMOVED,
    clip as Clip,
    onChainBid.amount,
    currency,
    onChainBid.sellOnShare.value,
    bidder,
    recipient,
    bid.createdAtTimestamp,
    bid.createdAtBlockNumber,
    event.block.timestamp,
    event.block.number
  )

  // Update Currency Liquidity
  currency.liquidity = currency.liquidity.minus(bid.amount)
  currency.save()

  // Remove Bid
  store.remove('Bid', bidId)

  log.info(`[handleBidRemoved] done tokenId: {}, currency: {}, amount: {}, bidder: {}, recipient: {}, sellOnShare: {}`, [
    tokenId,
    onChainBid.currency.toHexString(),
    onChainBid.amount.toString(),
    onChainBid.bidder.toHexString(),
    onChainBid.recipient.toHexString(),
    onChainBid.sellOnShare.value.toString()
  ]);
}

/**
 * Handler called when the `BidFinalized` Event is emitted on the Market Contract
 * @param event
 */
export function handleBidFinalized(event: BidFinalized): void {
  const tokenId = event.params.tokenId.toString()
  const clip = Clip.load(tokenId)
  const onChainBid = event.params.bid

  const bidId = tokenId.concat('-').concat(onChainBid.bidder.toHexString());

  log.info(`[handleBidFinalized] tokenId: {}, currency: {}, amount: {}, bidder: {}, recipient: {}, sellOnShare: {}`, [
    tokenId,
    onChainBid.currency.toHexString(),
    onChainBid.amount.toString(),
    onChainBid.bidder.toHexString(),
    onChainBid.recipient.toHexString(),
    onChainBid.sellOnShare.value.toString()
  ]);


  if (clip == null) {
    log.error('[handleBidFinalized] missing CLIP for tokenId: {}', [tokenId]);
    return;
  }

  const bid = Bid.load(bidId)
  if (bid == null) {
    log.error('[handleBidFinalized] missing Bid for tokenId: {} and bidId: {}', [tokenId, bidId]);
    return;
  }

  const inactiveBidId = tokenId
    .concat('-')
    .concat(event.transaction.hash.toHexString())
    .concat('-')
    .concat(event.transactionLogIndex.toString())

  const bidder = findOrCreateUser(onChainBid.bidder.toHexString())
  const recipient = findOrCreateUser(onChainBid.recipient.toHexString())
  const currency = findOrCreateCurrency(onChainBid.currency.toHexString())

  // BidFinalized is always **two** events after transfer
  // (transfer bidshare to prev owner, transfer media to bid recipient - Market.sol/_finalizeNFTTransfer)
  // Find the transfer by id and set the from address as the prevOwner of the clip
  const transferId = event.params.tokenId
    .toString()
    .concat('-')
    .concat(event.transaction.hash.toHexString())
    .concat('-')
    .concat(event.transactionLogIndex.minus(BigInt.fromI32(2)).toString())
  const transfer = Transfer.load(transferId)
  if (transfer == null) {
    log.error('[handleBidFinalized] missing Transfer for tokenId: {} and transferId: {}', [tokenId, transferId]);
    return;
  }

  clip.prevOwner = transfer.from
  clip.save()

  // Create Inactive Bid
  createInactiveBid(
    inactiveBidId,
    event.transaction.hash.toHexString(),
    FINALIZED,
    clip as Clip,
    onChainBid.amount,
    currency,
    onChainBid.sellOnShare.value,
    bidder,
    recipient,
    bid.createdAtTimestamp,
    bid.createdAtBlockNumber,
    event.block.timestamp,
    event.block.number
  )

  // Update Currency Liquidity
  currency.liquidity = currency.liquidity.minus(bid.amount)
  currency.save()

  // Remove Bid
  store.remove('Bid', bidId)

  log.info(`[handleBidFinalized] done tokenId: {}, currency: {}, amount: {}, bidder: {}, recipient: {}, sellOnShare: {}`, [
    tokenId,
    onChainBid.currency.toHexString(),
    onChainBid.amount.toString(),
    onChainBid.bidder.toHexString(),
    onChainBid.recipient.toHexString(),
    onChainBid.sellOnShare.value.toString()
  ]);
}
