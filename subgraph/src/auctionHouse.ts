import {
  createReserveAuction,
  createReserveAuctionBid,
  findOrCreateCurrency,
  findOrCreateUser,
  handleBidReplaced,
  handleFinishedAuction,
  handleReserveAuctionExtended,
  setReserveAuctionFirstBidTime,
} from './utils'
import {
  AuctionHouse,
  AuctionApprovalUpdated,
  AuctionBid,
  AuctionCanceled,
  AuctionCreated,
  AuctionDurationExtended,
  AuctionEnded,
  AuctionReservePriceUpdated,
} from '../generated/AuctionHouse/AuctionHouse'
import { Clip, ReserveAuction } from '../generated/schema'
import { log } from '@graphprotocol/graph-ts'

export function handleReserveAuctionCreated(event: AuctionCreated): void {
  let auctionId = event.params.auctionId.toString()
  log.info(`[handleReserveAuctionCreated] auction {}`, [auctionId])

  let tokenOwner = findOrCreateUser(event.params.tokenOwner.toHexString())
  let curator = findOrCreateUser(event.params.curator.toHexString())

  let clip = loadClipFromReserveAuctionCreatedEvent(event)

  createReserveAuction(
    auctionId,
    event.transaction.hash.toHexString(),
    event.params.tokenId,
    event.params.tokenContract.toHexString(),
    clip,
    event.params.duration,
    event.params.reservePrice,
    event.params.curatorFeePercentage,
    findOrCreateCurrency(event.params.auctionCurrency.toHexString()),
    event.block.timestamp,
    event.block.number,
    tokenOwner,
    curator
  )

  log.info(`[handleReserveAuctionCreated] done auction {}`, [auctionId])

}

export function handleReserveAuctionApprovalUpdate(event: AuctionApprovalUpdated): void {
  let auctionId = event.params.auctionId.toString()
  log.info(`[handleReserveAuctionApprovalUpdate] auction {}`, [auctionId])

  let auction = ReserveAuction.load(auctionId)
  if (auction == null) {
    log.error('[handleReserveAuctionApprovalUpdate] missing Auction for id: {}', [auctionId]);
    return;
  }

  auction.approved = event.params.approved
  auction.status = 'Active'
  auction.approvedTimestamp = event.block.timestamp
  auction.approvedBlockNumber = event.block.number
  auction.save()

  log.info(`[handleReserveAuctionApprovalUpdate] done auction {}`, [auctionId])
}

export function handleReserveAuctionReservePriceUpdate(
  event: AuctionReservePriceUpdated
): void {
  let auctionId = event.params.auctionId.toString()
  log.info(`[handleReserveAuctionReservePriceUpdate] auction {}`, [auctionId])

  let auction = ReserveAuction.load(auctionId)
  if (auction == null) {
    log.error('[handleReserveAuctionReservePriceUpdate] missing Auction for id: {}', [auctionId]);
    return;
  }

  auction.reservePrice = event.params.reservePrice
  auction.save()

  log.info(`[handleReserveAuctionReservePriceUpdate] done auction {}`, [auctionId])
}

export function handleReserveAuctionBid(event: AuctionBid): void {
  let auctionId = event.params.auctionId.toString()
  log.info(`[handleReserveAuctionBid] auction {}`, [auctionId])

  let auction = ReserveAuction.load(auctionId)

  if (auction === null) {
    log.error('[handleReserveAuctionBid] missing reserve auction with id {} for bid', [auctionId])
    return
  }

  if (event.params.firstBid) {
    log.info('[handleReserveAuctionBid] setting auction first bid time', [])
    setReserveAuctionFirstBidTime(auction, event.block.timestamp)
  } else {
    let auctionCurrentBidId = auction.currentBid
    if (auctionCurrentBidId === null) {
      log.error('[handleReserveAuctionBid] missing current bid for reserve auction with id {}', [auctionId])
      return
    }
    log.info('[handleReserveAuctionBid] replacing bid {}', [auctionCurrentBidId])
    handleBidReplaced(
      auctionCurrentBidId,
      event.block.timestamp,
      event.block.number
    )
  }

  let id = auctionId
    .concat('-')
    .concat(event.transaction.hash.toHexString())
    .concat('-')
    .concat(event.logIndex.toString())

  createReserveAuctionBid(
    id,
    event.transaction.hash.toHexString(),
    auction,
    event.params.value,
    event.block.timestamp,
    event.block.number,
    findOrCreateUser(event.params.sender.toHexString())
  )

  log.info(`[handleReserveAuctionBid] done auction {}`, [auctionId])
}

export function handleReserveAuctionDurationExtended(
  event: AuctionDurationExtended
): void {
  let auctionId = event.params.auctionId.toString()
  log.info(`[handleReserveAuctionDurationExtended] auction {}`, [auctionId])

  let auction = ReserveAuction.load(auctionId)

  if (auction === null) {
    log.error('[handleReserveAuctionDurationExtended] missing reserve auction with id {} for bid', [auctionId])
    return
  }

  handleReserveAuctionExtended(auction, event.params.duration)

  log.info(`[handleReserveAuctionDurationExtended] done auction {}`, [auctionId])
}

export function handleReserveAuctionEnded(event: AuctionEnded): void {
  let auctionId = event.params.auctionId.toString()
  log.info(`[handleReserveAuctionEnded] auction {}`, [auctionId])

  let auction = ReserveAuction.load(auctionId)

  if (!auction) {
    log.error('[handleReserveAuctionEnded] missing reserve auction with id {} for bid', [auctionId])
    return
  }

  let auctionCurrentBidId = auction.currentBid
  if (auctionCurrentBidId === null) {
    log.error('[handleReserveAuctionEnded] missing current bid for reserve auction with id {}', [auctionId])
    return
  }

  // First, remove the current bid and set it to the winning bid
  handleBidReplaced(
    auctionCurrentBidId,
    event.block.timestamp,
    event.block.number,
    true
  )

  // Then, finalize the auction
  handleFinishedAuction(
    auction,
    event.block.timestamp,
    event.block.number
  )

  log.info(`[handleReserveAuctionEnded] done auction {}`, [auctionId])
}

export function handleReserveAuctionCanceled(event: AuctionCanceled): void {
  let auctionId = event.params.auctionId.toString()
  log.info(`[handleReserveAuctionCanceled] auction {}`, [auctionId])

  let auction = ReserveAuction.load(auctionId)
  if (auction == null) {
    log.error('[handleReserveAuctionCanceled] missing Auction for id: {}', [auctionId]);
    return;
  }


  // First, remove any current bid and set it to refunded
  let auctionCurrentBidId = auction.currentBid
  if (auctionCurrentBidId) {
    handleBidReplaced(
      auctionCurrentBidId,
      event.block.timestamp,
      event.block.number
    )
  }

  // Then, create an inactive auction based of of the current active auction
  // Then, finalize the auction
  handleFinishedAuction(
    auction,
    event.block.timestamp,
    event.block.number,
    true
  )

  log.info(`[handleReserveAuctionCanceled] done auction {}`, [auctionId])
}

function loadClipFromReserveAuctionCreatedEvent(event: AuctionCreated): Clip | null {
  let tokenId = event.params.tokenId.toString()
  let auctionHouse = AuctionHouse.bind(event.address)
  let clipAddress = auctionHouse.zora()

  if (event.params.tokenContract.toHexString() == clipAddress.toHexString()) {
    return Clip.load(tokenId)
  }

  return null
}
