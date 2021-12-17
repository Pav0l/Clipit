import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { User, URIUpdate, Transfer, Ask, Bid, InactiveAsk, InactiveBid, Currency, Clip } from "../generated/schema";
import { ClipIt } from "../generated/ClipIt/ClipIt";
import { AskCreatedAskStruct, AskRemovedAskStruct, BidCreatedBidStruct, BidFinalizedBidStruct, BidRemovedBidStruct, Market } from "../generated/Market/Market";
import { ERC20 } from "../generated/Market/ERC20";
import { ERC20NameBytes } from "../generated/Market/ERC20NameBytes";
import { ERC20SymbolBytes } from "../generated/Market/ERC20SymbolBytes";


export const zeroAddress = '0x0000000000000000000000000000000000000000';

export function findOrCreateUser(id: string): User {
  let user = User.load(id);

  if (user == null) {
    user = new User(id);
    user.save();
  }

  return user;
}

export function createURIUpdate(
  id: string,
  transactionHash: string,
  clip: Clip,
  type: string,
  from: string,
  to: string,
  updater: string,
  owner: string,
  createdAtTimestamp: BigInt,
  createdAtBlockNumber: BigInt
): URIUpdate {
  let uriUpdate = new URIUpdate(id)
  uriUpdate.transactionHash = transactionHash
  uriUpdate.clip = clip.id
  uriUpdate.type = type
  uriUpdate.from = from
  uriUpdate.to = to
  uriUpdate.updater = updater
  uriUpdate.owner = owner
  uriUpdate.createdAtTimestamp = createdAtTimestamp
  uriUpdate.createdAtBlockNumber = createdAtBlockNumber

  uriUpdate.save()
  return uriUpdate
}

export function createTransfer(
  id: string,
  transactionHash: string,
  clip: Clip,
  from: User,
  to: User,
  createdAtTimestamp: BigInt,
  createdAtBlockNumber: BigInt
): Transfer {
  let transfer = new Transfer(id)
  transfer.clip = clip.id
  transfer.transactionHash = transactionHash
  transfer.from = from.id
  transfer.to = to.id
  transfer.createdAtTimestamp = createdAtTimestamp
  transfer.createdAtBlockNumber = createdAtBlockNumber

  transfer.save()
  return transfer
}

export function createClip(
  id: string,
  transactionHash: string,
  owner: User,
  creator: User,
  prevOwner: User,
  contentURI: string,
  contentHash: Bytes,
  metadataURI: string,
  metadataHash: Bytes,
  creatorBidShare: BigInt,
  ownerBidShare: BigInt,
  prevOwnerBidShare: BigInt,
  createdAtTimestamp: BigInt,
  createdAtBlockNumber: BigInt
): Clip {
  let clip = new Clip(id)
  clip.owner = owner.id
  clip.transactionHash = transactionHash
  clip.creator = creator.id
  clip.prevOwner = prevOwner.id
  clip.contentURI = contentURI
  clip.contentHash = contentHash
  clip.metadataURI = metadataURI
  clip.metadataHash = metadataHash
  clip.creatorBidShare = creatorBidShare
  clip.ownerBidShare = ownerBidShare
  clip.prevOwnerBidShare = prevOwnerBidShare
  clip.createdAtTimestamp = createdAtTimestamp
  clip.createdAtBlockNumber = createdAtBlockNumber

  clip.save()
  return clip
}

export function fetchClipBidShares(tokenId: BigInt, clipAddress: Address): BidShares {
  let clip = ClipIt.bind(clipAddress)
  let marketAddress = clip.marketContract()
  let market = Market.bind(marketAddress)
  let bidSharesTry = market.try_bidSharesForToken(tokenId)
  if (bidSharesTry.reverted) {
    return new BidShares(BigInt.zero(), BigInt.zero(), BigInt.zero())
  }

  return new BidShares(
    bidSharesTry.value.creator.value,
    bidSharesTry.value.owner.value,
    bidSharesTry.value.prevOwner.value
  )
}


export class BidShares {
  creator: BigInt
  owner: BigInt
  prevOwner: BigInt

  constructor(creator: BigInt, owner: BigInt, prevOwner: BigInt) {
    this.creator = creator
    this.owner = owner
    this.prevOwner = prevOwner
  }
}

// createAsk
export function createAsk(
  id: string,
  transactionHash: string,
  amount: BigInt,
  currency: Currency,
  clip: Clip,
  createdAtTimestamp: BigInt,
  createdAtBlockNumber: BigInt
): Ask {
  let ask = new Ask(id)
  ask.transactionHash = transactionHash
  ask.amount = amount
  ask.currency = currency.id
  ask.clip = clip.id
  ask.owner = clip.owner
  ask.createdAtTimestamp = createdAtTimestamp
  ask.createdAtBlockNumber = createdAtBlockNumber

  ask.save()
  return ask
}

// createBid
export function createBid(
  id: string,
  transactionHash: string,
  amount: BigInt,
  currency: Currency,
  sellOnShare: BigInt,
  bidder: User,
  recipient: User,
  clip: Clip,
  createdAtTimestamp: BigInt,
  createdAtBlockNumber: BigInt
): Bid {
  let bid = new Bid(id)
  bid.transactionHash = transactionHash
  bid.amount = amount
  bid.currency = currency.id
  bid.sellOnShare = sellOnShare
  bid.bidder = bidder.id
  bid.recipient = recipient.id
  bid.clip = clip.id
  bid.createdAtTimestamp = createdAtTimestamp
  bid.createdAtBlockNumber = createdAtBlockNumber

  bid.save()
  return bid
}

// createInactiveAsk
export function createInactiveAsk(
  id: string,
  transactionHash: string,
  clip: Clip,
  type: string,
  amount: BigInt,
  currency: Currency,
  owner: string,
  createdAtTimestamp: BigInt,
  createdAtBlockNumber: BigInt,
  inactivatedAtTimestamp: BigInt,
  inactivatedAtBlockNumber: BigInt
): InactiveAsk {
  let inactiveAsk = new InactiveAsk(id)

  inactiveAsk.type = type
  inactiveAsk.clip = clip.id
  inactiveAsk.amount = amount
  inactiveAsk.currency = currency.id
  inactiveAsk.owner = owner
  inactiveAsk.createdAtTimestamp = createdAtTimestamp
  inactiveAsk.createdAtBlockNumber = createdAtBlockNumber
  inactiveAsk.inactivatedAtTimestamp = inactivatedAtTimestamp
  inactiveAsk.inactivatedAtBlockNumber = inactivatedAtBlockNumber
  inactiveAsk.transactionHash = transactionHash

  inactiveAsk.save()
  return inactiveAsk
}

// createInactiveBid
export function createInactiveBid(
  id: string,
  transactionHash: string,
  type: string,
  clip: Clip,
  amount: BigInt,
  currency: Currency,
  sellOnShare: BigInt,
  bidder: User,
  recipient: User,
  createdAtTimestamp: BigInt,
  createdAtBlockNumber: BigInt,
  inactivatedAtTimestamp: BigInt,
  inactivatedAtBlockNumber: BigInt
): InactiveBid {
  let inactiveBid = new InactiveBid(id)
  inactiveBid.type = type
  inactiveBid.transactionHash = transactionHash
    ; (inactiveBid.clip = clip.id), (inactiveBid.amount = amount)
  inactiveBid.currency = currency.id
  inactiveBid.sellOnShare = sellOnShare
  inactiveBid.bidder = bidder.id
  inactiveBid.recipient = recipient.id
  inactiveBid.createdAtTimestamp = createdAtTimestamp
  inactiveBid.createdAtBlockNumber = createdAtBlockNumber
  inactiveBid.inactivatedAtTimestamp = inactivatedAtTimestamp
  inactiveBid.inactivatedAtBlockNumber = inactivatedAtBlockNumber

  inactiveBid.save()
  return inactiveBid
}

// findOrCreateCurrency
export function findOrCreateCurrency(id: string): Currency {
  let currency = Currency.load(id)

  if (currency == null) {
    currency = createCurrency(id)
  }

  return currency as Currency
}


function createCurrency(id: string): Currency {
  let currency = new Currency(id)
  currency.liquidity = BigInt.fromI32(0)

  if (id == zeroAddress) {
    currency.name = 'Ethereum'
    currency.symbol = 'ETH'
    currency.decimals = 18
    currency.save()
    return currency
  }

  let name = fetchCurrencyName(Address.fromString(id))
  let symbol = fetchCurrencySymbol(Address.fromString(id))
  let decimals = fetchCurrencyDecimals(Address.fromString(id))

  currency.name = name
  currency.symbol = symbol
  currency.decimals = decimals

  currency.save()
  return currency
}

function fetchCurrencyDecimals(currencyAddress: Address): i32 {
  let contract = ERC20.bind(currencyAddress)
  // try types uint8 for decimals
  let decimalValue = null
  let decimalResult = contract.try_decimals()
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value
  }
  return decimalValue as i32
}

/**
 * Fetch the `symbol` from the specified ERC20 contract on the Blockchain
 * @param currencyAddress
 */
function fetchCurrencySymbol(currencyAddress: Address): string {
  let contract = ERC20.bind(currencyAddress)
  let contractSymbolBytes = ERC20SymbolBytes.bind(currencyAddress)

  // try types string and bytes32 for symbol
  let symbolValue = 'unknown'
  let symbolResult = contract.try_symbol()
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol()
    if (!symbolResultBytes.reverted) {
      // for broken pairs that have no symbol function exposed
      if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
        symbolValue = symbolResultBytes.value.toString()
      }
    }
  } else {
    symbolValue = symbolResult.value
  }

  return symbolValue
}

/**
 * Fetch the `name` of the specified ERC20 contract on the blockchain
 * @param currencyAddress
 */
function fetchCurrencyName(currencyAddress: Address): string {
  let contract = ERC20.bind(currencyAddress)
  let contractNameBytes = ERC20NameBytes.bind(currencyAddress)

  // try types string and bytes32 for name
  let nameValue = 'unknown'
  let nameResult = contract.try_name()
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name()
    if (!nameResultBytes.reverted) {
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString()
      }
    }
  } else {
    nameValue = nameResult.value
  }

  return nameValue
}

function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}



