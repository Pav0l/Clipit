import { ethers, waffle } from "hardhat";
import { expect } from "chai";
import { BigNumber, ContractFactory, ContractReceipt, Wallet } from "ethers";
import { ClipIt } from "../typechain/ClipIt"
import { CONTRACT_NAME } from "../lib";


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
  let one: Wallet, two: Wallet, three: Wallet, beforeEachWallet: Wallet;

  const clipCID = 'clipCID';
  // 'clipCID' token Id
  const tid = BigNumber.from("3168405825740219867040700576505120080443780731148527622846639649708184909701");
  const defaultBaseURI = "ipfs://"

  beforeEach(async () => {
    [one, two, beforeEachWallet, three] = waffle.provider.getWallets();

    contractFactory = await ethers.getContractFactory(CONTRACT_NAME, { signer: one });
    contract = await contractFactory.deploy() as ClipIt;

    await contract.allowMint(beforeEachWallet.address, clipCID);
    await contract.mint(beforeEachWallet.address, clipCID);
  })

  it("deploy: set proper owner, contract name & symbol", async () => {
    const owner = await contract.owner();
    expect(owner).to.eql(one.address);

    const name = await contract.name();
    expect(name).to.eql(CONTRACT_NAME);

    const symbol = await contract.symbol();
    expect(symbol).to.eql("CLIP");
  });

  it("allowMint: can only be called by contract owner", async () => {
    const twoCaller = await contract.connect(two);
    await expect(twoCaller.allowMint(two.address, 'cid')).to.be.revertedWith("caller is not owner");
  });

  it("allowMint: allows an address to mint a specific cid", async () => {
    await contract.allowMint(two.address, "cid");
    await contract.mint(two.address, "cid");
  });


  it("allowMint: single address can approve multiple cids", async () => {
    await contract.allowMint(two.address, "cid1");
    await contract.allowMint(two.address, "cid2");
    await contract.mint(two.address, "cid1");
    await contract.mint(two.address, "cid2");
  });


  it("allowMint: overwrites cancelMint", async () => {
    await contract.allowMint(two.address, "cid");
    await contract.cancelMint(two.address, "cid");
    await contract.allowMint(two.address, "cid");
    await contract.mint(two.address, "cid");
  });

  it("allowMint: can not allow minted cid", async () => {
    await contract.allowMint(two.address, "cid");
    await contract.mint(two.address, "cid");
    await expect(contract.allowMint(two.address, "cid")).to.be.revertedWith("token already minted");
  });

  it("allowMint: can be called multiple times on same cid", async () => {
    await contract.allowMint(two.address, "cid");
    await contract.allowMint(two.address, "cid");
    await contract.allowMint(two.address, "cid");
    const cidMintStatus = await contract.getAllowedToMint(two.address, "cid");
    expect(cidMintStatus).to.eql(1); // 1 === Allowed
  });

  it("cancelMint: can only be called by contract owner", async () => {
    const twoCaller = await contract.connect(two);
    await expect(twoCaller.cancelMint(two.address, 'cid')).to.be.revertedWith("caller is not owner");
  });

  it("cancelMint: cancel previously allowed cid mint from an address", async () => {
    await contract.allowMint(two.address, "cid");
    await contract.cancelMint(two.address, "cid");
    await expect(contract.mint(two.address, "cid")).to.be.revertedWith("address not allowed to mint this token");
  });

  it("cancelMint: cannot be called on non-existent or minted cid", async () => {
    await contract.allowMint(two.address, "cid");
    await contract.mint(two.address, "cid");
    await expect(contract.cancelMint(two.address, "cid")).to.be.revertedWith("token already minted");
  });

  it("cancelMint: can be called multiple times on same cid", async () => {
    await contract.cancelMint(two.address, "cid");
    await contract.cancelMint(two.address, "cid");
    await contract.cancelMint(two.address, "cid");

    const cidMintStatus = await contract.getAllowedToMint(two.address, "cid");
    expect(cidMintStatus).to.eql(0); // 0 === NotExistantOrCanceled
  });

  it("getAllowedToMint: can only be called by owner", async () => {
    const twoCaller = await contract.connect(two);
    await expect(twoCaller.getAllowedToMint(two.address, 'cid')).to.be.revertedWith("caller is not owner");
  });

  it("mint: generates new tokenId for owner, adds proper tokenId owner, emits msg", async () => {
    await contract.allowMint(two.address, "cid");
    const tx = await contract.mint(two.address, 'cid');
    const receipt = await tx.wait();

    const args = expectEventWithArgs<{ tokenId: BigNumber }>(receipt, "Transfer", (args) => {
      expect(args["from"]).to.eql(ethers.constants.AddressZero);
      expect(args["to"]).to.eql(two.address);
      expect(args["tokenId"]).to.exist;
      return { tokenId: args["tokenId"] };
    });

    expect(args?.tokenId).to.not.eql(undefined);

    const ownerOf = await contract.ownerOf(args!.tokenId);
    expect(ownerOf).to.eql(two.address);

    const balanceOf = await contract.balanceOf(two.address);
    expect(balanceOf.toString()).to.eql("1");
  });

  it("mint: can not mint to 0 address", async () => {
    await contract.allowMint(ethers.constants.AddressZero, "cid");
    await expect(contract.mint(ethers.constants.AddressZero, 'cid')).to.be.revertedWith("ERC721: mint to the zero address");
  });

  it("mint: can not mint CID that already exists", async () => {
    await contract.allowMint(one.address, clipCID);
    // clipCID minted in beforeEach block
    await expect(contract.mint(one.address, clipCID)).to.be.revertedWith("ERC721: token already minted")
  });

  it("mint: does not allow minting non-existing address", async () => {
    await expect(contract.mint(two.address, "cid")).to.be.revertedWith("address not allowed to mint this token");
  });

  it("mint: does not allow minting token from address that was not pre-approved", async () => {
    // approve different address than minting
    await contract.allowMint(one.address, "cid");
    await expect(contract.mint(two.address, "cid")).to.be.revertedWith("address not allowed to mint this token");
  });

  it("mint: does not allow minting non-existing _cid", async () => {
    // approve different CID than minting
    await contract.allowMint(two.address, clipCID);
    await expect(contract.mint(two.address, "cid")).to.be.revertedWith("address not allowed to mint this token");
  });

  it("mint: does not allow minting _cid that was already minted", async () => {
    await contract.allowMint(two.address, "cid");
    await contract.mint(two.address, "cid");
    await expect(contract.mint(two.address, "cid")).to.be.revertedWith("address not allowed to mint this token")
  });

  it("mint: changes token state to Minted in isAllowedToMint mapping", async () => {
    await contract.allowMint(two.address, "cid");
    await contract.mint(two.address, "cid");

    const cidMintStatus = await contract.getAllowedToMint(two.address, "cid");
    expect(cidMintStatus).to.eql(2); // 2 === Minted
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

  it("tokenURI: returns proper URI", async () => {
    const tokenURI = await contract.tokenURI(tid);
    expect(tokenURI).to.eql(defaultBaseURI + clipCID);
  });

  it("tokenURI: reverts if tokenId does not exist", async () => {
    await expect(contract.tokenURI('does-not-exist')).to.be.reverted;
  });

  it("setBaseURI: can be only called by contract owner", async () => {
    const twoCaller = await contract.connect(two);
    await expect(twoCaller.setBaseURI('foo')).to.be.reverted;
  });

  it("setBaseURI: permanently changes baseTokenURI", async () => {
    const newBase = "https://domain.com/"
    await contract.setBaseURI(newBase);

    const tokenURI = await contract.tokenURI(tid);
    expect(tokenURI).to.eql(newBase + clipCID);
  });

  it("approve: non existing tokenId reverts", async () => {
    await expect(
      contract.approve(one.address, BigNumber.from("2168405825740219867040700576505120080443780731148527622846639649708184909701"))
    ).to.be.revertedWith("ERC721: owner query for nonexistent token");
  });

  it("approve: owner of token approving transfer to himself", async () => {
    await expect(contract.approve(beforeEachWallet.address, tid)).to.be.revertedWith("ERC721: approval to current owner");
  });

  it("approve: caller is not owner / 'approved for all' approves", async () => {
    const invalidCaller = await contract.connect(three);
    await expect(invalidCaller.approve(three.address, tid)).to.be.revertedWith("ERC721: approve caller is not owner nor approved for all");
  });

  it("approve: approves transfer to address & emits event", async () => {
    const ownerCaller = await contract.connect(beforeEachWallet);

    const tx = await ownerCaller.approve(three.address, tid);
    const receipt = await tx.wait();

    expectEventWithArgs(receipt, 'Approval', (args) => {
      expect(args['owner']).to.eql(beforeEachWallet.address);
      expect(args['approved']).to.eql(three.address);
      expect(args['tokenId'].toString()).to.eql(tid.toString());
    });

    const isApproved = await contract.getApproved(tid);
    expect(isApproved).to.eql(three.address);
  });

  it("approve: to different address overwrites previous approval", async () => {
    const ownerCaller = await contract.connect(beforeEachWallet);
    await ownerCaller.approve(three.address, tid);
    expect(await contract.getApproved(tid)).to.eql(three.address);

    await ownerCaller.approve(two.address, tid);
    expect(await contract.getApproved(tid)).to.eql(two.address);

    // zero address approval clears approval for tid
    await ownerCaller.approve(ethers.constants.AddressZero, tid);
    expect(await contract.getApproved(tid)).to.eql(ethers.constants.AddressZero);
  });

  it("getApproved: non existing tokenId reverts", async () => {
    await expect(
      contract.getApproved(BigNumber.from("2168405825740219867040700576505120080443780731148527622846639649708184909701"))
    ).to.be.revertedWith("ERC721: approved query for nonexistent token");
  });

  it("setApprovalForAll: can not set approval for caller (self)", async () => {
    await expect(
      contract.setApprovalForAll(one.address, true)
    ).to.be.revertedWith("ERC721: approve to caller");
  });

  it("setApprovalForAll: approves operator for transfers & emits event", async () => {
    const tx = await contract.setApprovalForAll(two.address, true);
    const receipt = await tx.wait();

    expectEventWithArgs(receipt, 'ApprovalForAll', (args) => {
      expect(args['owner']).to.eql(one.address);
      expect(args['operator']).to.eql(two.address);
      expect(args['approved']).to.eql(true);
    });

    expect(await contract.isApprovedForAll(one.address, two.address)).to.eql(true);
  });

  it("setApprovalForAll: can overwrite previous approval for the same caller", async () => {
    await contract.setApprovalForAll(two.address, true);
    expect(await contract.isApprovedForAll(one.address, two.address)).to.eql(true);

    await contract.setApprovalForAll(two.address, false);
    expect(await contract.isApprovedForAll(one.address, two.address)).to.eql(false);
  });

  it("isApprovedForAll: returns false for non-approved operators", async () => {
    expect(await contract.isApprovedForAll(three.address, beforeEachWallet.address)).to.eql(false);
  });

  describe("token transfers", function () {
    it("safeTransferFrom: non-existing token reverts", async () => {
      await expect(
        contract["safeTransferFrom(address,address,uint256)"](one.address, beforeEachWallet.address, BigNumber.from("2168405825740219867040700576505120080443780731148527622846639649708184909701"))
      ).to.be.revertedWith("ERC721: operator query for nonexistent token");
    });

    it("safeTransferFrom: caller is not approved or owner", async () => {
      await expect(
        contract["safeTransferFrom(address,address,uint256)"](one.address, beforeEachWallet.address, tid)
      ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
    });

    describe("after approve", function () {
      let ownerCaller: ClipIt;
      beforeEach(async () => {
        ownerCaller = await contract.connect(beforeEachWallet);
        await ownerCaller.approve(one.address, tid);
      })

      it("safeTransferFrom: caller is not owner reverts", async () => {
        await expect(
          // beforeEachWallet is owner (should be `from`)
          ownerCaller["safeTransferFrom(address,address,uint256)"](one.address, ethers.constants.AddressZero, tid)
        ).to.be.revertedWith("ERC721: transfer of token that is not own");
      });

      it("safeTransferFrom: transfer to zero address reverts", async () => {
        await expect(
          // `to` can not be zero address
          ownerCaller["safeTransferFrom(address,address,uint256)"](beforeEachWallet.address, ethers.constants.AddressZero, tid)
        ).to.be.revertedWith("ERC721: transfer to the zero address");
      });

      it("safeTransferFrom: clears approvals & emits event, updates token counts & new owner, emits event", async () => {
        const beforeEachWalletBalance = (await ownerCaller.balanceOf(beforeEachWallet.address)).toNumber();
        const oneAddressBalance = (await ownerCaller.balanceOf(one.address)).toNumber();

        const tx = await ownerCaller["safeTransferFrom(address,address,uint256)"](beforeEachWallet.address, one.address, tid);
        const receipt = await tx.wait();

        expectEventWithArgs(receipt, 'Approval', (args) => {
          expect(args['owner']).to.eql(beforeEachWallet.address);
          expect(args['approved']).to.eql(ethers.constants.AddressZero);
          expect(args['tokenId'].toString()).to.eql(tid.toString());
        });

        expect(await ownerCaller.getApproved(tid)).to.eql(ethers.constants.AddressZero);

        expect((await ownerCaller.balanceOf(beforeEachWallet.address)).toNumber()).to.eql(beforeEachWalletBalance - 1);
        expect((await ownerCaller.balanceOf(one.address)).toNumber()).to.eql(oneAddressBalance + 1);
        expect(await ownerCaller.ownerOf(tid)).to.eql(one.address);

        expectEventWithArgs(receipt, 'Transfer', (args) => {
          expect(args['from']).to.eql(beforeEachWallet.address);
          expect(args['to']).to.eql(one.address);
          expect(args['tokenId'].toString()).to.eql(tid.toString());
        });
      });
    });
  });
});
