import { initSynchronousWithTestClients } from "../../../../tests/init-tests";
import { signerAddress } from "../../../../tests/__fixtures__/ethereum";
import { NftController } from "../nft.controller";
import { NftModel } from "../nft.model";

describe("nft controller", () => {
  let model: NftModel;
  let ctrl: NftController;

  beforeEach(() => {
    const init = initSynchronousWithTestClients(CONFIG);
    model = init.model.nft;
    ctrl = init.operations.nft;
  });

  it("getCurrentSignerTokensMetadata sets metadata", async () => {
    await ctrl.getCurrentSignerTokensMetadata("addressX0X0");

    expect(model.meta.isLoading).toEqual(false);
    expect(model.meta.error).toEqual(undefined);
    expect(model.metadata.length).toBeGreaterThan(0);
    expect(model.metadata[0].tokenId).toEqual("1");
  });

  it("getTokenMetadata sets metadata", async () => {
    await ctrl.getTokenMetadata("1");

    expect(model.meta.isLoading).toEqual(false);
    expect(model.meta.error).toEqual(undefined);
    expect(model.metadata.length).toBeGreaterThan(0);
    expect(model.metadata[0].tokenId).toEqual("1");
  });

  it("getClips sets clips metadata", async () => {
    await ctrl.getClips();

    expect(model.meta.isLoading).toEqual(false);
    expect(model.meta.error).toEqual(undefined);
    expect(model.metadata.length).toBeGreaterThan(0);
    expect(model.metadata[0].tokenId).toEqual("1");
  });

  it("getOwnerMetadata", async () => {
    let m = ctrl.getOwnerMetadata(null);
    expect(m).toEqual([]);

    // still no owner metadata
    m = ctrl.getOwnerMetadata(signerAddress);
    expect(m).toEqual([]);

    // set some metadata
    await ctrl.getCurrentSignerTokensMetadata(signerAddress);
    m = ctrl.getOwnerMetadata(signerAddress);
    expect(m[0].tokenId).toEqual("1");
  });
});
