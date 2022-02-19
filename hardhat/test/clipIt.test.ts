import { ethers, waffle, network } from "hardhat";
import { expect } from "chai";
import { BigNumber, ContractFactory, ContractReceipt, Wallet, BigNumberish } from "ethers";
import { ClipIt } from "../typechain/ClipIt";
import { Market } from "../typechain/Market";
import { BaseERC20 } from "../typechain/BaseERC20";

import { generateSignature, Decimal } from "../lib";
import { arrayify, Bytes, Signature } from "@ethersproject/contracts/node_modules/@ethersproject/bytes";
import { keccak256, sha256, toUtf8Bytes } from "ethers/lib/utils";

function expectEventWithArgs<T>(receipt: ContractReceipt, eventName: string, assertion: (eventArgs: any) => T) {
  const receiptEvents = receipt.events || [];

  for (const event of receiptEvents) {
    if (event.event === eventName) {
      return assertion(event.args);
    }
  }
}

describe("ClipIt", function () {
  let contractFactory: ContractFactory;
  let contract: ClipIt;
  let marketContract: Market;
  let contractOwner: Wallet, two: Wallet, three: Wallet, four: Wallet;
  let currencyContract: BaseERC20;

  const clipCID = "clipCID";
  // "clipCID" token Id
  const tid = BigNumber.from("0");
  const invalidTokenId = BigNumber.from(1000);

  const mtdt =
    '{"name":"Almost again","description":"streamer playing game","external_url":"https://foo.bar/nft/id","image":"ipfs://bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku","cid":"bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku","attributes":[{"trait_type":"Game","value":"name of game"},{"trait_type":"Streamer","value":"name of streamer"}]}';
  const metadataURI = "ipfs://metadataCid";
  const metadataHash = sha256(toUtf8Bytes(mtdt));
  const metadataHashBytes = arrayify(metadataHash);
  const tokenURI = `ipfs://${clipCID}`;
  const contentHash = sha256(toUtf8Bytes("content"));
  const contentHashBytes = arrayify(contentHash);

  const defaultAsk = (amount: number = 1000, currency: string = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707") => ({
    amount: amount,
    currency: currency,
  });
  const defaultBid = (currency: string, bidder: string, recipient?: string) => ({
    // Amount of the currency being bid
    amount: 500,
    // Address to the ERC20 token being used to bid
    currency,
    // Address of the bidder
    bidder,
    // Address of the recipient
    recipient: recipient ?? bidder,
    // % of the next sale to award the current owner
    sellOnShare: Decimal.from(10),
  });

  interface MediaData {
    tokenURI: string;
    metadataURI: string;
    // keccak256(contentCid)
    contentHash: Bytes;
    // keccak256(metadataCid)
    metadataHash: Bytes;
  }

  interface DecimalValue {
    value: BigNumber;
  }

  interface BidShares {
    owner: DecimalValue;
    prevOwner: DecimalValue;
    creator: DecimalValue;
  }

  async function mint(
    contract: ClipIt,
    metadataURI: string,
    tokenURI: string,
    contentHash: Bytes,
    metadataHash: Bytes,
    shares: BidShares,
    sig: Signature
  ) {
    const data: MediaData = {
      tokenURI,
      metadataURI,
      contentHash,
      metadataHash,
    };
    return contract.mint(data, shares, sig.v, sig.r, sig.s);
  }

  async function deployCurrency(owner: Wallet) {
    const factory = await ethers.getContractFactory("BaseERC20", { signer: owner });
    currencyContract = (await factory.deploy("test", "TEST", 18)) as BaseERC20;
    return currencyContract.address;
  }

  async function approveCurrency(owner: Wallet, spender: string) {
    const ownerCaller = currencyContract.connect(owner);
    await ownerCaller.approve(spender, ethers.constants.MaxUint256);
  }
  async function mintCurrency(to: string, value: BigNumberish = BigNumber.from("1000000")) {
    await currencyContract.mint(to, value);
  }

  beforeEach(async () => {
    [contractOwner, two, three, four] = waffle.provider.getWallets();

    const marketFactory = await ethers.getContractFactory("Market", { signer: contractOwner });
    marketContract = (await marketFactory.deploy()) as Market;

    contractFactory = await ethers.getContractFactory("ClipIt", { signer: contractOwner });
    contract = (await contractFactory.deploy(marketContract.address)) as ClipIt;

    await marketContract.configure(contract.address);
  });

  it("deploy: set proper owner, contract name & symbol", async () => {
    const owner = await contract.owner();
    expect(owner).to.eql(contractOwner.address);

    const name = await contract.name();
    expect(name).to.eql("ClipIt");

    const symbol = await contract.symbol();
    expect(symbol).to.eql("CLIP");

    const market = await contract.marketContract();
    expect(market).to.eql(marketContract.address);
  });

  it("ownerOf: non existing tokenId reverts", async () => {
    await expect(contract.ownerOf("hello")).to.be.reverted;
  });

  it("balanceOf: zero address reverts", async () => {
    await expect(contract.balanceOf(ethers.constants.AddressZero)).to.be.reverted;
  });

  it("balanceOf: address with no tokens minted", async () => {
    const balanceOf = await contract.balanceOf(three.address);
    expect(balanceOf.toString()).to.eql("0");
  });

  describe("mint:", () => {
    it("generates new token", async () => {
      const sig = await generateSignature(contractOwner, contentHash, two.address);

      const signerTwo = await contract.connect(two);
      const tx = await mint(
        signerTwo,
        metadataURI,
        tokenURI,
        contentHashBytes,
        metadataHashBytes,
        {
          creator: Decimal.from(10),
          owner: Decimal.from(80),
          prevOwner: Decimal.from(10),
        },
        sig
      );
      const receipt = await tx.wait();

      expectEventWithArgs(receipt, "Transfer", (args) => {
        expect(args["from"]).to.eql(ethers.constants.AddressZero);
        expect(args["to"]).to.eql(two.address);
        expect(args["tokenId"]).to.exist;
        expect(args!.tokenId.toString()).to.eql("0");
      });

      const tokenCreator = await contract.tokenCreators(tid);
      expect(tokenCreator).eq(two.address);

      const previousTokenOwners = await contract.previousTokenOwners(tid);
      expect(previousTokenOwners).eq(two.address);

      const tokenContentHashes = await contract.tokenContentHashes(tid);
      expect(tokenContentHashes).eq(contentHash);

      const returnedTokenURI = await contract.tokenURI(tid);
      expect(returnedTokenURI).eq(tokenURI);

      const tokenMetadataHashes = await contract.tokenMetadataHashes(tid);
      expect(tokenMetadataHashes).eq(metadataHash);

      const tokenMetadataURI = await contract.tokenMetadataURI(tid);
      expect(tokenMetadataURI).eq(metadataURI);

      const ownerOf = await contract.ownerOf(tid);
      expect(ownerOf).eql(two.address);

      const token = await contract.tokenOfOwnerByIndex(two.address, 0);
      expect(token.toString()).eql(tid.toString());

      const bidShares = await marketContract.bidSharesForToken(tid);
      expect(bidShares.owner.value.toString()).eql("80000000000000000000");
      expect(bidShares.creator.value.toString()).eql("10000000000000000000");
      expect(bidShares.prevOwner.value.toString()).eql("10000000000000000000");
    });

    // it("can not mint to 0 address", async () => {
    //   // unable to do, since we use `msg.sender` for the `_to` parameter
    //   // might need if we use the `_to` argument for `mint` function
    //   // but you can not verify if `_to` is really streamers address unless you keep it on chain/off chain sig verification
    // });

    it("can not mint content that already was already minted", async () => {
      const sig = await generateSignature(contractOwner, contentHash, contractOwner.address);
      await mint(
        contract,
        metadataURI,
        tokenURI,
        contentHashBytes,
        metadataHashBytes,
        {
          creator: Decimal.from(10),
          owner: Decimal.from(80),
          prevOwner: Decimal.from(10),
        },
        sig
      );

      await expect(
        mint(
          contract,
          metadataURI,
          tokenURI,
          contentHashBytes,
          metadataHashBytes,
          {
            creator: Decimal.from(10),
            owner: Decimal.from(80),
            prevOwner: Decimal.from(10),
          },
          sig
        )
      ).to.be.revertedWith("ClipIt: a token has already been created with this content hash");
    });

    it("does not allow minting with invalid signature signer", async () => {
      // signer `two` is not contract owner
      const sig = await generateSignature(two, contentHash, two.address);
      await expect(
        mint(
          contract,
          metadataURI,
          tokenURI,
          contentHashBytes,
          metadataHashBytes,
          {
            creator: Decimal.from(10),
            owner: Decimal.from(80),
            prevOwner: Decimal.from(10),
          },
          sig
        )
      ).to.be.revertedWith("ClipIt: address not allowed to mint");
    });

    it("does not allow minting with invalid signature address", async () => {
      const sig = await generateSignature(contractOwner, contentHash, three.address);
      // signed address and msg.sender do not match
      await expect(
        mint(
          contract,
          metadataURI,
          tokenURI,
          contentHashBytes,
          metadataHashBytes,
          {
            creator: Decimal.from(10),
            owner: Decimal.from(80),
            prevOwner: Decimal.from(10),
          },
          sig
        )
      ).to.be.revertedWith("ClipIt: address not allowed to mint");
    });

    it("does not allow minting with invalid signature cid", async () => {
      const contentHash = keccak256(toUtf8Bytes("other content identifier"));
      const sig = await generateSignature(contractOwner, contentHash, three.address);
      // signed contentHash and ocntentHashBytes do not match
      await expect(
        mint(
          contract,
          metadataURI,
          tokenURI,
          contentHashBytes,
          metadataHashBytes,
          {
            creator: Decimal.from(10),
            owner: Decimal.from(80),
            prevOwner: Decimal.from(10),
          },
          sig
        )
      ).to.be.revertedWith("ClipIt: address not allowed to mint");
    });

    it("token and mint URIs must exist", async () => {
      const sig = await generateSignature(contractOwner, contentHash, contractOwner.address);
      // empty metadataURI
      await expect(
        mint(
          contract,
          "",
          tokenURI,
          contentHashBytes,
          metadataHashBytes,
          {
            creator: Decimal.from(10),
            owner: Decimal.from(80),
            prevOwner: Decimal.from(10),
          },
          sig
        )
      ).to.be.revertedWith("ClipIt: specified uri must be non-empty");

      // empty tokenURI
      await expect(
        mint(
          contract,
          metadataURI,
          "",
          contentHashBytes,
          metadataHashBytes,
          {
            creator: Decimal.from(10),
            owner: Decimal.from(80),
            prevOwner: Decimal.from(10),
          },
          sig
        )
      ).to.be.revertedWith("ClipIt: specified uri must be non-empty");
    });

    it("contentHash can not be empty", async () => {
      const sig = await generateSignature(contractOwner, ethers.constants.HashZero, contractOwner.address);
      await expect(
        mint(
          contract,
          metadataURI,
          tokenURI,
          arrayify(ethers.constants.HashZero),
          metadataHashBytes,
          {
            creator: Decimal.from(10),
            owner: Decimal.from(80),
            prevOwner: Decimal.from(10),
          },
          sig
        )
      ).to.be.revertedWith("ClipIt: content hash must be non-zero");
    });

    it("metadataHash can not be empty", async () => {
      const sig = await generateSignature(contractOwner, contentHash, contractOwner.address);
      await expect(
        mint(
          contract,
          metadataURI,
          tokenURI,
          contentHashBytes,
          arrayify(ethers.constants.HashZero),
          {
            creator: Decimal.from(10),
            owner: Decimal.from(80),
            prevOwner: Decimal.from(10),
          },
          sig
        )
      ).to.be.revertedWith("ClipIt: metadata hash must be non-zero");
    });

    it("bidShares must eql to 100", async () => {
      const sig = await generateSignature(contractOwner, contentHash, contractOwner.address);
      await expect(
        mint(
          contract,
          metadataURI,
          tokenURI,
          contentHashBytes,
          metadataHashBytes,
          {
            creator: Decimal.from(10),
            // owner share too big
            owner: Decimal.from(90),
            prevOwner: Decimal.from(10),
          },
          sig
        )
      ).to.be.revertedWith("Market: Invalid bid shares, must sum to 100");
    });
  });

  describe("verifiedMint:", () => {
    it("allows contract owner to mint clip to specific creator address", async () => {
      const data: MediaData = {
        tokenURI,
        metadataURI,
        contentHash: contentHashBytes,
        metadataHash: metadataHashBytes,
      };
      const tx = await contract.verifiedMint(two.address, data, {
        creator: Decimal.from(10),
        owner: Decimal.from(80),
        prevOwner: Decimal.from(10),
      });
      const receipt = await tx.wait();

      expectEventWithArgs(receipt, "Transfer", (args) => {
        expect(args["from"]).to.eql(ethers.constants.AddressZero);
        expect(args["to"]).to.eql(two.address);
        expect(args["tokenId"]).to.exist;
        expect(args!.tokenId.toString()).to.eql("0");
      });

      const tokenCreator = await contract.tokenCreators(tid);
      expect(tokenCreator).eq(two.address);

      const previousTokenOwners = await contract.previousTokenOwners(tid);
      expect(previousTokenOwners).eq(two.address);

      const tokenContentHashes = await contract.tokenContentHashes(tid);
      expect(tokenContentHashes).eq(contentHash);

      const returnedTokenURI = await contract.tokenURI(tid);
      expect(returnedTokenURI).eq(tokenURI);

      const tokenMetadataHashes = await contract.tokenMetadataHashes(tid);
      expect(tokenMetadataHashes).eq(metadataHash);

      const tokenMetadataURI = await contract.tokenMetadataURI(tid);
      expect(tokenMetadataURI).eq(metadataURI);

      const ownerOf = await contract.ownerOf(tid);
      expect(ownerOf).eql(two.address);

      const token = await contract.tokenOfOwnerByIndex(two.address, 0);
      expect(token.toString()).eql(tid.toString());

      const bidShares = await marketContract.bidSharesForToken(tid);
      expect(bidShares.owner.value.toString()).eql("80000000000000000000");
      expect(bidShares.creator.value.toString()).eql("10000000000000000000");
      expect(bidShares.prevOwner.value.toString()).eql("10000000000000000000");
    });

    it("can not mint to 0 address", async () => {
      const data: MediaData = {
        tokenURI,
        metadataURI,
        contentHash: contentHashBytes,
        metadataHash: metadataHashBytes,
      };

      await expect(
        contract.verifiedMint(ethers.constants.AddressZero, data, {
          creator: Decimal.from(10),
          owner: Decimal.from(80),
          prevOwner: Decimal.from(10),
        })
      ).to.be.revertedWith("ERC721: mint to the zero address");
    });

    it("can not be called by other address than owner", async () => {
      const data: MediaData = {
        tokenURI,
        metadataURI,
        contentHash: contentHashBytes,
        metadataHash: metadataHashBytes,
      };

      const caller = contract.connect(two);

      await expect(
        caller.verifiedMint(two.address, data, {
          creator: Decimal.from(10),
          owner: Decimal.from(80),
          prevOwner: Decimal.from(10),
        })
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("burn:", () => {
    beforeEach(async () => {
      const sig = await generateSignature(contractOwner, contentHash, contractOwner.address);

      await mint(
        contract,
        metadataURI,
        tokenURI,
        contentHashBytes,
        metadataHashBytes,
        {
          creator: Decimal.from(10),
          owner: Decimal.from(80),
          prevOwner: Decimal.from(10),
        },
        sig
      );
    });

    it("burns token", async () => {
      // owner balance and token supply exist before burn
      const balanceBefore = await contract.balanceOf(contractOwner.address);
      expect(balanceBefore.toString()).eql("1");
      const supplyBefore = await contract.totalSupply();
      expect(supplyBefore.toString()).eql("1");

      // burn
      const tx = await contract.burn(tid);
      const receipt = await tx.wait();

      const balanceAfter = await contract.balanceOf(contractOwner.address);
      // _holderTokens[owner] removed
      expect(balanceAfter.toString()).eql("0");

      const supplyAfter = await contract.totalSupply();
      // _tokenOwners removed
      expect(supplyAfter.toString()).eql("0");

      // Transfer to zero address emitted
      expectEventWithArgs<void>(receipt, "Transfer", (args) => {
        expect(args["from"]).to.eql(contractOwner.address);
        expect(args["to"]).to.eql(ethers.constants.AddressZero);
        expect(args!.tokenId.toString()).to.eql("0");
      });

      // Approvals cleared
      await expect(contract.getApproved(tid)).revertedWith("ERC721: approved query for nonexistent token");
      // Approval event to zero address emitted
      expectEventWithArgs<void>(receipt, "Approval", (args) => {
        expect(args["owner"]).to.eql(contractOwner.address);
        expect(args["approved"]).to.eql(ethers.constants.AddressZero);
        expect(args!.tokenId.toString()).to.eql("0");
      });

      // tokenURI stays
      const tokenUriAfterBurn = await contract.tokenURI(tid);
      expect(tokenUriAfterBurn).eql(tokenURI);

      // previousTokenOwners is deleted
      const previousOwner = await contract.previousTokenOwners(tid);
      expect(previousOwner).eql(ethers.constants.AddressZero);
    });

    it("approved caller can burn if owner is creator", async () => {
      await contract.approve(two.address, tid);
      const approvedCaller = contract.connect(two);

      // burn
      const tx = await approvedCaller.burn(tid);
      const receipt = await tx.wait();

      const balanceAfter = await approvedCaller.balanceOf(contractOwner.address);
      // _holderTokens[owner] removed
      expect(balanceAfter.toString()).eql("0");

      const supplyAfter = await approvedCaller.totalSupply();
      // _tokenOwners removed
      expect(supplyAfter.toString()).eql("0");

      // Transfer to zero address emitted
      expectEventWithArgs<void>(receipt, "Transfer", (args) => {
        expect(args["from"]).to.eql(contractOwner.address);
        expect(args["to"]).to.eql(ethers.constants.AddressZero);
        expect(args!.tokenId.toString()).to.eql("0");
      });

      // Approvals cleared
      await expect(approvedCaller.getApproved(tid)).revertedWith("ERC721: approved query for nonexistent token");
      // Approval event to zero address emitted
      expectEventWithArgs<void>(receipt, "Approval", (args) => {
        expect(args["owner"]).to.eql(contractOwner.address);
        expect(args["approved"]).to.eql(ethers.constants.AddressZero);
        expect(args!.tokenId.toString()).to.eql("0");
      });

      // tokenURI stays
      const tokenUriAfterBurn = await approvedCaller.tokenURI(tid);
      expect(tokenUriAfterBurn).eql(tokenURI);

      // previousTokenOwners is deleted
      const previousOwner = await approvedCaller.previousTokenOwners(tid);
      expect(previousOwner).eql(ethers.constants.AddressZero);
    });

    it("can burn only existing token", async () => {
      await expect(contract.burn(invalidTokenId)).revertedWith("ClipIt: nonexistent token");
    });

    it("caller has to be approved or owner", async () => {
      const unknownCaller = contract.connect(four);
      await expect(unknownCaller.burn(tid)).revertedWith("ClipIt: Only approved or owner");
    });

    it("caller has to be owner and creator", async () => {
      await contract.transferFrom(contractOwner.address, four.address, tid);

      const newOwner = contract.connect(four);
      await expect(newOwner.burn(tid)).revertedWith("ClipIt: owner is not creator of media");
    });

    it("approved caller can not burn if owner is not creator", async () => {
      await contract.transferFrom(contractOwner.address, four.address, tid);
      const newOwner = contract.connect(four);
      await newOwner.approve(two.address, tid);

      const approvedCaller = contract.connect(two);
      await expect(approvedCaller.burn(tid)).revertedWith("ClipIt: owner is not creator of media");
    });
  });

  describe("updateTokenURI:", () => {
    const newURI = "www.example.com";

    beforeEach(async () => {
      const sig = await generateSignature(contractOwner, contentHash, contractOwner.address);

      await mint(
        contract,
        metadataURI,
        tokenURI,
        contentHashBytes,
        metadataHashBytes,
        {
          creator: Decimal.from(10),
          owner: Decimal.from(80),
          prevOwner: Decimal.from(10),
        },
        sig
      );
    });

    it("only approved or owner", async () => {
      const unknownCaller = contract.connect(four);
      await expect(unknownCaller.updateTokenURI(tid, newURI)).revertedWith("ClipIt: Only approved or owner");
    });

    it("can not update tokenURI for non-existent token", async () => {
      await expect(contract.updateTokenURI(invalidTokenId, newURI)).revertedWith(
        "ERC721: operator query for nonexistent token"
      );
    });

    it("can not update tokenURI for burned token", async () => {
      await contract.burn(tid);
      await expect(contract.updateTokenURI(tid, newURI)).revertedWith("ERC721: operator query for nonexistent token");
    });

    it("must be valid URI", async () => {
      await expect(contract.updateTokenURI(tid, "")).revertedWith("ClipIt: specified uri must be non-empty");
    });

    it("sets the URI and emits for owner", async () => {
      const tx = await contract.updateTokenURI(tid, newURI);
      const receipt = await tx.wait();

      expectEventWithArgs<void>(receipt, "TokenURIUpdated", (args) => {
        expect(args["_tokenId"].toString()).to.eql(tid.toString());
        expect(args["owner"]).to.eql(contractOwner.address);
        expect(args["_uri"]).to.eql(newURI);
      });

      const updatedTokenURI = await contract.tokenURI(tid);
      expect(updatedTokenURI).eql(newURI);
    });

    it("sets the URI and emits for approved", async () => {
      await contract.approve(two.address, tid);

      const approved = contract.connect(two);
      const tx = await approved.updateTokenURI(tid, newURI);
      const receipt = await tx.wait();

      expectEventWithArgs<void>(receipt, "TokenURIUpdated", (args) => {
        expect(args["_tokenId"].toString()).to.eql(tid.toString());
        expect(args["owner"]).to.eql(two.address);
        expect(args["_uri"]).to.eql(newURI);
      });

      const updatedTokenURI = await approved.tokenURI(tid);
      expect(updatedTokenURI).eql(newURI);
    });
  });

  describe("updateTokenMetadataURI:", () => {
    const newURI = "www.example.com";

    beforeEach(async () => {
      const sig = await generateSignature(contractOwner, contentHash, contractOwner.address);

      await mint(
        contract,
        metadataURI,
        tokenURI,
        contentHashBytes,
        metadataHashBytes,
        {
          creator: Decimal.from(10),
          owner: Decimal.from(80),
          prevOwner: Decimal.from(10),
        },
        sig
      );
    });

    it("only approved or owner", async () => {
      const unknownCaller = contract.connect(four);
      await expect(unknownCaller.updateTokenMetadataURI(tid, newURI)).revertedWith("ClipIt: Only approved or owner");
    });

    it("can not update metadataURI for non-existent token", async () => {
      await expect(contract.updateTokenMetadataURI(invalidTokenId, newURI)).revertedWith(
        "ERC721: operator query for nonexistent token"
      );
    });

    it("can not update metadataURI for burned token", async () => {
      await contract.burn(tid);
      await expect(contract.updateTokenMetadataURI(tid, newURI)).revertedWith(
        "ERC721: operator query for nonexistent token"
      );
    });

    it("must be valid URI", async () => {
      await expect(contract.updateTokenMetadataURI(tid, "")).revertedWith("ClipIt: specified uri must be non-empty");
    });

    it("sets the URI and emits for owner", async () => {
      const tx = await contract.updateTokenMetadataURI(tid, newURI);
      const receipt = await tx.wait();

      expectEventWithArgs<void>(receipt, "TokenMetadataURIUpdated", (args) => {
        expect(args["_tokenId"].toString()).to.eql(tid.toString());
        expect(args["owner"]).to.eql(contractOwner.address);
        expect(args["_uri"]).to.eql(newURI);
      });

      const updatedTokenMetadataURI = await contract.tokenMetadataURI(tid);
      expect(updatedTokenMetadataURI).eql(newURI);
    });

    it("sets the URI and emits for approved", async () => {
      await contract.approve(two.address, tid);

      const approved = contract.connect(two);
      const tx = await approved.updateTokenMetadataURI(tid, newURI);
      const receipt = await tx.wait();

      expectEventWithArgs<void>(receipt, "TokenMetadataURIUpdated", (args) => {
        expect(args["_tokenId"].toString()).to.eql(tid.toString());
        expect(args["owner"]).to.eql(two.address);
        expect(args["_uri"]).to.eql(newURI);
      });

      const updatedTokenMetadataURI = await approved.tokenMetadataURI(tid);
      expect(updatedTokenMetadataURI).eql(newURI);
    });
  });

  describe("approve:", () => {
    beforeEach(async () => {
      const sig = await generateSignature(contractOwner, contentHash, contractOwner.address);

      await mint(
        contract,
        metadataURI,
        tokenURI,
        contentHashBytes,
        metadataHashBytes,
        {
          creator: Decimal.from(10),
          owner: Decimal.from(80),
          prevOwner: Decimal.from(10),
        },
        sig
      );
    });

    it("non existing tokenId reverts", async () => {
      await expect(contract.approve(two.address, invalidTokenId)).to.be.revertedWith(
        "ERC721: owner query for nonexistent token"
      );
    });

    it("owner of token approving transfer to himself", async () => {
      await expect(contract.approve(contractOwner.address, tid)).to.be.revertedWith(
        "ERC721: approval to current owner"
      );
    });

    it("caller is not owner / 'approved for all' approves", async () => {
      const invalidCaller = await contract.connect(three);
      await expect(invalidCaller.approve(three.address, tid)).to.be.revertedWith(
        "ERC721: approve caller is not owner nor approved for all"
      );
    });

    it("approves transfer to address & emits event", async () => {
      const tx = await contract.approve(three.address, tid);
      const receipt = await tx.wait();

      expectEventWithArgs(receipt, "Approval", (args) => {
        expect(args["owner"]).to.eql(contractOwner.address);
        expect(args["approved"]).to.eql(three.address);
        expect(args["tokenId"].toString()).to.eql(tid.toString());
      });

      const isApproved = await contract.getApproved(tid);
      expect(isApproved).to.eql(three.address);
    });

    it("to different address overwrites previous approval", async () => {
      await contract.approve(three.address, tid);
      expect(await contract.getApproved(tid)).to.eql(three.address);

      await contract.approve(two.address, tid);
      expect(await contract.getApproved(tid)).to.eql(two.address);

      // zero address approval clears approval for tid
      await contract.approve(ethers.constants.AddressZero, tid);
      expect(await contract.getApproved(tid)).to.eql(ethers.constants.AddressZero);
    });

    it("getApproved: non existing tokenId reverts", async () => {
      await expect(
        contract.getApproved(
          BigNumber.from("2168405825740219867040700576505120080443780731148527622846639649708184909701")
        )
      ).to.be.revertedWith("ERC721: approved query for nonexistent token");
    });

    describe("setApprovalForAll", () => {
      it("can not set approval for caller (self)", async () => {
        await expect(contract.setApprovalForAll(contractOwner.address, true)).to.be.revertedWith(
          "ERC721: approve to caller"
        );
      });

      it("approves operator for transfers & emits event", async () => {
        const tx = await contract.setApprovalForAll(two.address, true);
        const receipt = await tx.wait();

        expectEventWithArgs(receipt, "ApprovalForAll", (args) => {
          expect(args["owner"]).to.eql(contractOwner.address);
          expect(args["operator"]).to.eql(two.address);
          expect(args["approved"]).to.eql(true);
        });

        expect(await contract.isApprovedForAll(contractOwner.address, two.address)).to.eql(true);
      });

      it("can overwrite previous approval for the same caller", async () => {
        await contract.setApprovalForAll(two.address, true);
        expect(await contract.isApprovedForAll(contractOwner.address, two.address)).to.eql(true);

        await contract.setApprovalForAll(two.address, false);
        expect(await contract.isApprovedForAll(contractOwner.address, two.address)).to.eql(false);
      });

      it("isApprovedForAll: returns false for non-approved operators", async () => {
        expect(await contract.isApprovedForAll(three.address, four.address)).to.eql(false);
      });
    });
  });

  describe("revokeApproval:", () => {
    beforeEach(async () => {
      const sig = await generateSignature(contractOwner, contentHash, contractOwner.address);

      await mint(
        contract,
        metadataURI,
        tokenURI,
        contentHashBytes,
        metadataHashBytes,
        {
          creator: Decimal.from(10),
          owner: Decimal.from(80),
          prevOwner: Decimal.from(10),
        },
        sig
      );

      await contract.approve(two.address, tid);
    });

    it("caller must be approved", async () => {
      const unknownCaller = contract.connect(three);
      await expect(unknownCaller.revokeApproval(tid)).revertedWith("ClipIt: caller not approved address");
    });

    it("token owner can not revoke approval", async () => {
      await expect(contract.revokeApproval(tid)).revertedWith("ClipIt: caller not approved address");
    });

    it("token creator can not revoke approval", async () => {
      const newOwner = contract.connect(three);
      await contract.transferFrom(contractOwner.address, three.address, tid);

      const owner = await contract.ownerOf(tid);
      expect(owner).eql(three.address);

      await expect(newOwner.revokeApproval(tid)).revertedWith("ClipIt: caller not approved address");
    });

    it("revokes approval & emits", async () => {
      const approvedCaller = contract.connect(two);

      let approved = await contract.getApproved(tid);
      expect(approved).eql(two.address);

      const tx = await approvedCaller.revokeApproval(tid);
      const receipt = await tx.wait();
      expectEventWithArgs(receipt, "Approval", (args) => {
        expect(args["owner"]).to.eql(contractOwner.address);
        expect(args["approved"]).to.eql(ethers.constants.AddressZero);
        expect(args["tokenId"].toString()).to.eql(tid.toString());
      });

      approved = await contract.getApproved(tid);
      expect(approved).eql(ethers.constants.AddressZero);
    });
  });

  describe("safeTransferFrom:", () => {
    beforeEach(async () => {
      const sig = await generateSignature(contractOwner, contentHash, contractOwner.address);

      await mint(
        contract,
        metadataURI,
        tokenURI,
        contentHashBytes,
        metadataHashBytes,
        {
          creator: Decimal.from(10),
          owner: Decimal.from(80),
          prevOwner: Decimal.from(10),
        },
        sig
      );
    });

    it("non-existing token reverts", async () => {
      await expect(
        contract["safeTransferFrom(address,address,uint256)"](contractOwner.address, four.address, invalidTokenId)
      ).revertedWith("ERC721: operator query for nonexistent token");
    });

    it("caller is not approved or owner", async () => {
      const otherCaller = contract.connect(two);
      await expect(
        otherCaller["safeTransferFrom(address,address,uint256)"](two.address, four.address, tid)
      ).revertedWith("ERC721: transfer caller is not owner nor approved");
    });

    describe("after approve", function () {
      let approvedCaller: ClipIt;
      let approvedWallet: Wallet;

      beforeEach(async () => {
        approvedWallet = two;
        approvedCaller = contract.connect(two);
        await contract.approve(approvedWallet.address, tid);
      });

      it("caller is not owner reverts", async () => {
        await expect(
          // `from` (four) is not owner
          approvedCaller["safeTransferFrom(address,address,uint256)"](four.address, three.address, tid)
        ).revertedWith("ERC721: transfer of token that is not own");
      });

      it("transfer to zero address reverts", async () => {
        await expect(
          // `to` can not be zero address
          approvedCaller["safeTransferFrom(address,address,uint256)"](
            contractOwner.address,
            ethers.constants.AddressZero,
            tid
          )
        ).revertedWith("ERC721: transfer to the zero address");
      });

      it("clears approvals & emits event, updates token counts & new owner, emits event", async () => {
        const fourBalance = (await approvedCaller.balanceOf(four.address)).toNumber();
        const ownerBalance = (await approvedCaller.balanceOf(contractOwner.address)).toNumber();
        expect(await approvedCaller.ownerOf(tid)).to.eql(contractOwner.address);

        const tx = await approvedCaller["safeTransferFrom(address,address,uint256)"](
          contractOwner.address,
          four.address,
          tid
        );
        const receipt = await tx.wait();

        expectEventWithArgs(receipt, "Approval", (args) => {
          expect(args["owner"]).to.eql(contractOwner.address);
          expect(args["approved"]).to.eql(ethers.constants.AddressZero);
          expect(args["tokenId"].toString()).to.eql(tid.toString());
        });

        expect(await approvedCaller.getApproved(tid)).to.eql(ethers.constants.AddressZero);

        expect((await approvedCaller.balanceOf(four.address)).toNumber()).to.eql(fourBalance + 1);
        expect((await approvedCaller.balanceOf(contractOwner.address)).toNumber()).to.eql(ownerBalance - 1);
        expect(await approvedCaller.ownerOf(tid)).to.eql(four.address);

        expectEventWithArgs(receipt, "Transfer", (args) => {
          expect(args["from"]).to.eql(contractOwner.address);
          expect(args["to"]).to.eql(four.address);
          expect(args["tokenId"].toString()).to.eql(tid.toString());
        });
      });

      it("removes previous ask", async () => {
        const ask = {
          amount: 10,
          currency: "0xc778417e063141139fce010982780140aa0cd5ab",
        };
        await contract.setAsk(tid, ask);

        await contract.transferFrom(contractOwner.address, two.address, tid);

        const zeroAsk = await marketContract.currentAskForToken(tid);
        expect(zeroAsk.amount.toNumber()).to.eql(0);
        expect(zeroAsk.currency).to.eql(ethers.constants.AddressZero);
      });
    });
  });

  describe("setAsk:", () => {
    beforeEach(async () => {
      const sig = await generateSignature(contractOwner, contentHash, contractOwner.address);

      await mint(
        contract,
        metadataURI,
        tokenURI,
        contentHashBytes,
        metadataHashBytes,
        {
          creator: Decimal.from(10),
          owner: Decimal.from(80),
          prevOwner: Decimal.from(10),
        },
        sig
      );
    });

    it("can be called only by approved or owner", async () => {
      const otherCaller = contract.connect(two);
      await expect(otherCaller.setAsk(tid, defaultAsk())).revertedWith("ClipIt: Only approved or owner");
    });

    it("ask can not be 0", async () => {
      await expect(contract.setAsk(tid, { ...defaultAsk(), amount: 0 })).revertedWith(
        "Market: Ask invalid for share splitting"
      );
    });

    it("ask can not be split between BidShares", async () => {
      await expect(contract.setAsk(tid, { ...defaultAsk(), amount: 7 })).revertedWith(
        "Market: Ask invalid for share splitting"
      );
    });

    it("sets ask for token", async () => {
      const ask = defaultAsk();
      await contract.setAsk(tid, ask);

      const askForToken = await marketContract.currentAskForToken(tid);
      expect(askForToken.currency.toLowerCase()).eql(ask.currency.toLowerCase());
      expect(askForToken.amount.toNumber()).eql(ask.amount);

      // TODO assert events
    });
  });

  describe("removeAsk:", () => {
    beforeEach(async () => {
      const sig = await generateSignature(contractOwner, contentHash, contractOwner.address);

      await mint(
        contract,
        metadataURI,
        tokenURI,
        contentHashBytes,
        metadataHashBytes,
        {
          creator: Decimal.from(10),
          owner: Decimal.from(80),
          prevOwner: Decimal.from(10),
        },
        sig
      );

      await contract.setAsk(tid, defaultAsk());
    });

    it("can be called only by approved or owner", async () => {
      const otherCaller = contract.connect(two);
      await expect(otherCaller.removeAsk(tid)).revertedWith("ClipIt: Only approved or owner");
    });

    it("removes an ask for token", async () => {
      await contract.removeAsk(tid);

      const askForToken = await marketContract.currentAskForToken(tid);
      expect(askForToken.currency.toLowerCase()).eql(ethers.constants.AddressZero);
      expect(askForToken.amount.toNumber()).eql(0);
      // TODO assert events
    });
  });

  describe("setBid:", () => {
    let bidder: ClipIt;
    let otherBidder: ClipIt;
    let bidderAddress: string, otherBidderAddress: string;
    let currencyAddress: string;

    beforeEach(async () => {
      const sig = await generateSignature(contractOwner, contentHash, contractOwner.address);

      await mint(
        contract,
        metadataURI,
        tokenURI,
        contentHashBytes,
        metadataHashBytes,
        {
          creator: Decimal.from(0),
          owner: Decimal.from(100),
          prevOwner: Decimal.from(0),
        },
        sig
      );

      bidder = contract.connect(two);
      bidderAddress = two.address;
      otherBidder = contract.connect(three);
      otherBidderAddress = three.address;

      currencyAddress = await deployCurrency(contractOwner);
      await approveCurrency(contractOwner, marketContract.address);
      await mintCurrency(contractOwner.address);
      await approveCurrency(two, marketContract.address);
      await mintCurrency(bidderAddress);
      await approveCurrency(three, marketContract.address);
      await mintCurrency(otherBidderAddress);
    });

    it("reverts on nonexisting tokenId", async () => {
      await expect(bidder.setBid(invalidTokenId, defaultBid(currencyAddress, bidderAddress))).revertedWith(
        "ClipIt: nonexistent token"
      );
    });

    it("sender is not bidder reverts", async () => {
      await expect(bidder.setBid(tid, defaultBid(currencyAddress, otherBidderAddress))).revertedWith(
        "Market: Bidder must be msg sender"
      );
    });

    it("callable only by 'media' contract", async () => {
      await expect(
        marketContract.setBid(tid, defaultBid(currencyAddress, bidderAddress), contractOwner.address)
      ).revertedWith("Market: Only media contract");
    });

    it("cannot bid amount of 0", async () => {
      await expect(bidder.setBid(tid, { ...defaultBid(currencyAddress, bidderAddress), amount: 0 })).revertedWith(
        "Market: cannot bid amount of 0"
      );
    });

    it("bid currency cannot be 0 address", async () => {
      await expect(
        bidder.setBid(tid, { ...defaultBid(currencyAddress, bidderAddress), currency: ethers.constants.AddressZero })
      ).revertedWith("Market: bid currency cannot be 0 address");
    });

    it("bid recipient cannot be 0 address", async () => {
      await expect(
        bidder.setBid(tid, defaultBid(currencyAddress, bidderAddress, ethers.constants.AddressZero))
      ).revertedWith("Market: bid recipient cannot be 0 addres");
    });

    it("invalid sellOnShare reverts", async () => {
      const shares = await marketContract.bidSharesForToken(tid);
      // creator BidShare from mint is X, so any sellOnShare that would make `creator share + sellOnShare` over 100
      // is invalid
      const invalidSellOnShare = Decimal.from(BigNumber.from(101).sub(shares.creator.value).toNumber());
      await expect(
        bidder.setBid(tid, { ...defaultBid(currencyAddress, bidderAddress), sellOnShare: invalidSellOnShare })
      ).revertedWith("Market: Sell on fee invalid for share splitting");
    });

    it("reverts if bidder does not have enough allowance for their bidding currency", async () => {
      const noAllowanceCaller = contract.connect(four);
      await expect(noAllowanceCaller.setBid(tid, defaultBid(currencyAddress, four.address))).revertedWith(
        "SafeERC20: ERC20 operation did not succeed"
      );
    });

    it("reverts if bidder does not have enough balance for their bidding currency", async () => {
      const noBalanceCaller = contract.connect(four);
      await approveCurrency(four, marketContract.address);
      await expect(noBalanceCaller.setBid(tid, defaultBid(currencyAddress, four.address))).revertedWith(
        "SafeERC20: ERC20 operation did not succeed"
      );
    });

    it("sets the bid", async () => {
      const defBid = defaultBid(currencyAddress, bidderAddress);
      await bidder.setBid(tid, defBid);

      const bid = await marketContract.bidForTokenBidder(tid, bidderAddress);
      expect(bid.currency).eq(defBid.currency);
      expect(bid.amount.toNumber()).eq(defBid.amount);
      expect(bid.recipient).eq(defBid.recipient);
      expect(bid.bidder).eq(defBid.bidder);
      expect(bid.sellOnShare.value.toString()).eq(defBid.sellOnShare.value.toString());
    });

    it("refunds bidders previous bid when it exist", async () => {
      const bidderBalanceBeforeBid = await currencyContract.balanceOf(bidderAddress);

      const defBid = defaultBid(currencyAddress, bidderAddress);
      await bidder.setBid(tid, defBid);

      // bidder balance is corret after fist bid
      const bidderBalanceAfterBid = await currencyContract.balanceOf(bidderAddress);
      expect(bidderBalanceAfterBid.toNumber()).eql(
        bidderBalanceBeforeBid.sub(BigNumber.from(defBid.amount)).toNumber()
      );

      // this bid should refund previous bid
      const higherBid = { ...defaultBid(currencyAddress, bidderAddress), amount: defBid.amount * 2 };
      await bidder.setBid(tid, higherBid);

      // bidder balance is eql as if the first bid did not happen (it was refunded)
      const bidderBalanceAfterSecodBid = await currencyContract.balanceOf(bidderAddress);
      expect(bidderBalanceAfterSecodBid.toNumber()).eql(
        bidderBalanceBeforeBid.sub(BigNumber.from(higherBid.amount)).toNumber()
      );
    });

    it("finalizes NFT transfer if bid > ask", async () => {
      await contract.setAsk(tid, defaultAsk(10000, currencyAddress));

      const ownerBalanceBefore = await currencyContract.balanceOf(contractOwner.address);

      const bid = defaultBid(currencyAddress, bidderAddress);
      bid.amount = 10000;
      await bidder.setBid(tid, bid);

      const ownerBalanceAfter = await currencyContract.balanceOf(contractOwner.address);
      expect(ownerBalanceAfter.sub(ownerBalanceBefore).toNumber()).eql(10000);

      const newOwner = await contract.ownerOf(tid);
      expect(newOwner).eql(bidderAddress);
    });

    async function printBalance(promise: () => Promise<any>) {
      let creatorBalanceBefore = await currencyContract.balanceOf(contractOwner.address);
      let bidderBalanceBefore = await currencyContract.balanceOf(bidderAddress);
      let otherBalanceBefore = await currencyContract.balanceOf(otherBidderAddress);

      await promise();
      let creatorBalance = await currencyContract.balanceOf(contractOwner.address);
      let bidderBalance = await currencyContract.balanceOf(bidderAddress);
      let otherBalance = await currencyContract.balanceOf(otherBidderAddress);

      const shares = await marketContract.bidSharesForToken(tid);
      console.log("owner shares:", shares.owner.value.toString());
      console.log("previous owner shares:", shares.prevOwner.value.toString());

      console.log(`creator balance change:`, creatorBalance.toNumber() - creatorBalanceBefore.toNumber());
      console.log(`bidder balance change:`, bidderBalance.toNumber() - bidderBalanceBefore.toNumber());
      console.log(`otherBidder balance change:`, otherBalance.toNumber() - otherBalanceBefore.toNumber());
    }

    it("sellOnShare test", async () => {
      await contract.setAsk(tid, defaultAsk(500, currencyAddress));
      await printBalance(async () => console.log(""));

      console.log("\nBidder bidding 500 to creator");
      // bid with 10% sellOnShare
      // await bidder.setBid(tid, defaultBid(currencyAddress, bidderAddress));
      await printBalance(() => bidder.setBid(tid, defaultBid(currencyAddress, bidderAddress)));
      let newOwner = await contract.ownerOf(tid);
      // bidder is owner
      expect(newOwner).eql(bidderAddress);

      console.log("\nOther bidding 500 to bidder");
      bidder.setAsk(tid, defaultAsk(500, currencyAddress));
      // await otherBidder.setBid(tid, defaultBid(currencyAddress, otherBidderAddress));
      await printBalance(() => otherBidder.setBid(tid, defaultBid(currencyAddress, otherBidderAddress)));
      newOwner = await contract.ownerOf(tid);
      // bidder is owner
      expect(newOwner).eql(otherBidderAddress);

      console.log("\nBidder bidding 500 to other");
      otherBidder.setAsk(tid, defaultAsk(500, currencyAddress));
      // bid with 10% sellOnShare
      // await bidder.setBid(tid, defaultBid(currencyAddress, bidderAddress));
      await printBalance(() => bidder.setBid(tid, defaultBid(currencyAddress, bidderAddress)));
      newOwner = await contract.ownerOf(tid);
      // bidder is owner
      expect(newOwner).eql(bidderAddress);

      console.log("\nOther bidding 500 to bidder");
      bidder.setAsk(tid, defaultAsk(500, currencyAddress));
      // await otherBidder.setBid(tid, defaultBid(currencyAddress, otherBidderAddress));
      await printBalance(() => otherBidder.setBid(tid, defaultBid(currencyAddress, otherBidderAddress)));
      newOwner = await contract.ownerOf(tid);
      // bidder is owner
      expect(newOwner).eql(otherBidderAddress);

      console.log("\nBidder bidding 500 to other with 50% sellOnShare");
      otherBidder.setAsk(tid, defaultAsk(500, currencyAddress));
      // bid with 10% sellOnShare
      const bb = defaultBid(currencyAddress, bidderAddress);
      bb.sellOnShare = Decimal.from(50);
      // await bidder.setBid(tid, bb);
      await printBalance(() => bidder.setBid(tid, bb));
      newOwner = await contract.ownerOf(tid);
      // bidder is owner
      expect(newOwner).eql(bidderAddress);

      console.log("\nOther bidding 500 to bidder with 40% sellOnShare");
      bidder.setAsk(tid, defaultAsk(500, currencyAddress));
      const xb = defaultBid(currencyAddress, otherBidderAddress);
      xb.sellOnShare = Decimal.from(40);
      // await otherBidder.setBid(tid, xb);
      await printBalance(() => otherBidder.setBid(tid, xb));
      newOwner = await contract.ownerOf(tid);
      // bidder is owner
      expect(newOwner).eql(otherBidderAddress);

      console.log("\nBidder bidding 500 to other with 0% sellOnShare");
      otherBidder.setAsk(tid, defaultAsk(500, currencyAddress));
      // bid with 10% sellOnShare
      const yb = defaultBid(currencyAddress, bidderAddress);
      yb.sellOnShare = Decimal.from(0);
      // await bidder.setBid(tid, yb);
      await printBalance(() => bidder.setBid(tid, yb));
      newOwner = await contract.ownerOf(tid);
      // bidder is owner
      expect(newOwner).eql(bidderAddress);

      console.log("\nOther bidding 500 to bidder with 0% sellOnShare");
      bidder.setAsk(tid, defaultAsk(500, currencyAddress));
      const zb = defaultBid(currencyAddress, otherBidderAddress);
      zb.sellOnShare = Decimal.from(0);
      // await otherBidder.setBid(tid, zb);
      await printBalance(() => otherBidder.setBid(tid, zb));
      newOwner = await contract.ownerOf(tid);
      // bidder is owner
      expect(newOwner).eql(otherBidderAddress);

      console.log("\nBidder bidding 500 to other with 0% sellOnShare");
      otherBidder.setAsk(tid, defaultAsk(500, currencyAddress));
      // bid with 10% sellOnShare
      const wb = defaultBid(currencyAddress, bidderAddress);
      wb.sellOnShare = Decimal.from(0);
      // await bidder.setBid(tid, wb);
      await printBalance(() => bidder.setBid(tid, wb));
      newOwner = await contract.ownerOf(tid);
      // bidder is owner
      expect(newOwner).eql(bidderAddress);
    });
  });

  describe("removeBid:", () => {
    let bidder: ClipIt;
    let otherBidder: ClipIt;
    let bidderAddress: string, otherBidderAddress: string;
    let currencyAddress: string;

    beforeEach(async () => {
      const sig = await generateSignature(contractOwner, contentHash, contractOwner.address);

      await mint(
        contract,
        metadataURI,
        tokenURI,
        contentHashBytes,
        metadataHashBytes,
        {
          creator: Decimal.from(0),
          owner: Decimal.from(100),
          prevOwner: Decimal.from(0),
        },
        sig
      );

      bidder = contract.connect(two);
      bidderAddress = two.address;
      otherBidder = contract.connect(three);
      otherBidderAddress = three.address;

      currencyAddress = await deployCurrency(contractOwner);
      await approveCurrency(contractOwner, marketContract.address);
      await mintCurrency(contractOwner.address);
      await approveCurrency(two, marketContract.address);
      await mintCurrency(bidderAddress);
      await approveCurrency(three, marketContract.address);
      await mintCurrency(otherBidderAddress);
    });

    it("reverts on nonexisting tokenId", async () => {
      await expect(bidder.removeBid(invalidTokenId)).revertedWith("ClipIt: token with that id does not exist");
    });

    it("reverts if there is no existing bid on token", async () => {
      await expect(bidder.removeBid(tid)).revertedWith("Market: cannot remove bid amount of 0");
    });

    it("removes bid", async () => {
      await bidder.setBid(tid, defaultBid(currencyAddress, bidderAddress));
      await bidder.removeBid(tid);
      const b = await marketContract.bidForTokenBidder(tid, bidderAddress);
      expect(b.bidder).eql(ethers.constants.AddressZero);
      expect(b.amount.toString()).eql("0");
    });

    it("transfers bid amount to bidder", async () => {
      const bid = defaultBid(currencyAddress, bidderAddress);
      await bidder.setBid(tid, bid);

      const balanceAfterBid = await currencyContract.balanceOf(bidderAddress);
      await bidder.removeBid(tid);
      const balanceAfterRemovingBid = await currencyContract.balanceOf(bidderAddress);

      expect(balanceAfterRemovingBid.toNumber()).eql(balanceAfterBid.add(BigNumber.from(bid.amount)).toNumber());
      // TODO assert event
    });
  });

  describe("acceptBid:", () => {
    let bidder: ClipIt;
    let otherBidder: ClipIt;
    let bidderAddress: string, otherBidderAddress: string;
    let currencyAddress: string;

    beforeEach(async () => {
      const sig = await generateSignature(contractOwner, contentHash, contractOwner.address);

      await mint(
        contract,
        metadataURI,
        tokenURI,
        contentHashBytes,
        metadataHashBytes,
        {
          creator: Decimal.from(10),
          owner: Decimal.from(80),
          prevOwner: Decimal.from(10),
        },
        sig
      );

      bidder = contract.connect(two);
      bidderAddress = two.address;
      otherBidder = contract.connect(three);
      otherBidderAddress = three.address;

      currencyAddress = await deployCurrency(contractOwner);
      await approveCurrency(contractOwner, marketContract.address);
      await mintCurrency(contractOwner.address);
      await approveCurrency(two, marketContract.address);
      await mintCurrency(bidderAddress);
      await approveCurrency(three, marketContract.address);
      await mintCurrency(otherBidderAddress);
    });

    it("reverts on nonexisting tokenId", async () => {
      await expect(bidder.acceptBid(invalidTokenId, defaultBid(currencyAddress, bidderAddress))).revertedWith(
        "ERC721: operator query for nonexistent token"
      );
    });

    it("only approved or owner can accept bid", async () => {
      await expect(bidder.acceptBid(tid, defaultBid(currencyAddress, bidderAddress))).revertedWith(
        "ClipIt: Only approved or owner"
      );
    });

    it("only allable via media contract", async () => {
      await expect(marketContract.acceptBid(tid, defaultBid(currencyAddress, otherBidderAddress))).revertedWith(
        "Market: Only media contract"
      );
    });

    it("can not accept non-existing bid", async () => {
      await expect(contract.acceptBid(tid, defaultBid(currencyAddress, otherBidderAddress))).revertedWith(
        "Market: cannot accept bid of 0"
      );
    });

    it("can not accept unexpected bid (different then setBid)", async () => {
      const bid = defaultBid(currencyAddress, bidderAddress);
      await bidder.setBid(tid, bid);
      await expect(contract.acceptBid(tid, { ...bid, amount: 555 })).revertedWith("Market: Unexpected bid found.");
    });

    it("accepted bid has to be valid for splitting", async () => {
      const bid = defaultBid(currencyAddress, bidderAddress);
      bid.amount = 89;
      await bidder.setBid(tid, bid);
      await expect(contract.acceptBid(tid, bid)).revertedWith("Market: Bid invalid for share splitting");
    });

    it("accepts a bid", async () => {
      let creatorBalanceBefore = await currencyContract.balanceOf(contractOwner.address);
      let bidderBalanceBefore = await currencyContract.balanceOf(bidderAddress);
      let otherBalanceBefore = await currencyContract.balanceOf(otherBidderAddress);

      const bid = defaultBid(currencyAddress, bidderAddress);
      bid.sellOnShare = Decimal.from(15);
      await bidder.setBid(tid, bid);
      await contract.acceptBid(tid, bid);

      let creatorBalanceAfter = await currencyContract.balanceOf(contractOwner.address);
      let bidderBalanceAfter = await currencyContract.balanceOf(bidderAddress);
      let otherBalanceAfter = await currencyContract.balanceOf(otherBidderAddress);

      expect(creatorBalanceAfter.toNumber() - creatorBalanceBefore.toNumber()).eql(500);
      expect(bidderBalanceAfter.toNumber() - bidderBalanceBefore.toNumber()).eql(-500);
      expect(otherBalanceAfter.toNumber() - otherBalanceBefore.toNumber()).eql(0);

      const newOwner = await contract.ownerOf(tid);
      expect(newOwner).eql(bidderAddress);

      const bidShares = await marketContract.bidSharesForToken(tid);
      expect(bidShares.creator.value.toString()).eql("10000000000000000000");
      expect(bidShares.owner.value.toString()).eql("75000000000000000000");
      expect(bidShares.prevOwner.value.toString()).eql("15000000000000000000");

      // Another bid -> accept -> transfer
      creatorBalanceBefore = await currencyContract.balanceOf(contractOwner.address);
      bidderBalanceBefore = await currencyContract.balanceOf(bidderAddress);
      otherBalanceBefore = await currencyContract.balanceOf(otherBidderAddress);

      const otherBid = defaultBid(currencyAddress, otherBidderAddress);
      otherBid.sellOnShare = Decimal.from(15);
      await otherBidder.setBid(tid, otherBid);
      await bidder.acceptBid(tid, otherBid);

      creatorBalanceAfter = await currencyContract.balanceOf(contractOwner.address);
      bidderBalanceAfter = await currencyContract.balanceOf(bidderAddress);
      otherBalanceAfter = await currencyContract.balanceOf(otherBidderAddress);

      // +10% to creator, +15% from sellOnFee for prevOwner, +1% of owner share as developer fee (to contract owner)
      expect(creatorBalanceAfter.toNumber() - creatorBalanceBefore.toNumber()).eql(
        0.1 * 500 + 0.15 * 500 + Math.floor(0.75 * 500 * 0.01)
      ); // 128
      // +75% to owner of token minus the dev fee (1% of the 75%)
      expect(bidderBalanceAfter.toNumber() - bidderBalanceBefore.toNumber()).eql(
        0.75 * 500 - Math.floor(0.75 * 500 * 0.01)
      ); // 372
      expect(otherBalanceAfter.toNumber() - otherBalanceBefore.toNumber()).eql(-500);

      const anotherNewOwner = await contract.ownerOf(tid);
      expect(anotherNewOwner).eql(otherBidderAddress);

      const newBidShares = await marketContract.bidSharesForToken(tid);
      expect(newBidShares.creator.value.toString()).eql("10000000000000000000");
      expect(newBidShares.owner.value.toString()).eql("75000000000000000000");
      expect(newBidShares.prevOwner.value.toString()).eql("15000000000000000000");

      const bidRemoved = await marketContract.bidForTokenBidder(tid, otherBidderAddress);
      expect(bidRemoved.amount.toNumber()).eql(0);
      expect(bidRemoved.bidder).eql(ethers.constants.AddressZero);
      expect(bidRemoved.recipient).eql(ethers.constants.AddressZero);
      expect(bidRemoved.currency).eql(ethers.constants.AddressZero);
      expect(bidRemoved.sellOnShare.value.toString()).eq("0");
    });

    // TODO events where missing (check IMarket for events)
  });

  describe("erc165 support", () => {
    it("supports media metadata interface", async () => {
      const interfaceId = ethers.utils.arrayify("0x4e222e66");
      const supportsId = await contract.supportsInterface(interfaceId);
      expect(supportsId).eq(true);
    });
  });

  describe("ownable", () => {
    it("ClipIt can transfer owner", async () => {
      let owner = await contract.owner();
      expect(owner).to.eql(contractOwner.address);

      const newOwner = two;
      await contract.transferOwnership(newOwner.address);

      owner = await contract.owner();
      expect(owner).to.eql(newOwner.address);
    });

    it("Market can transfer owner", async () => {
      let owner = await marketContract.owner();
      expect(owner).to.eql(contractOwner.address);

      const newOwner = two;
      await marketContract.transferOwnership(newOwner.address);

      owner = await marketContract.owner();
      expect(owner).to.eql(newOwner.address);
    });
  });
});
