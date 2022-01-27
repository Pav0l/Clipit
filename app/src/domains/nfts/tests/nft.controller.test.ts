import { signerAddress } from "../../../../tests/__fixtures__/ethereum";
import { ClipItApiTestClient } from "../../../lib/clipit-api/clipit-api-test.client";
import { SubgraphTestClient } from "../../../lib/graphql/subgraph-test.client";
import { IpfsTestClient } from "../../../lib/ipfs/ipfs-test.client";
import { OffChainStorage } from "../../../lib/off-chain-storage/off-chain-storage.client";
import { MetaModel } from "../../app/meta.model";
import { SnackbarController } from "../../snackbar/snackbar.controller";
import { SnackbarModel } from "../../snackbar/snackbar.model";
import { NftController } from "../nft.controller";
import { NftModel } from "../nft.model";

describe("nft controller", () => {
  let model: NftModel;
  let ctrl: NftController;

  beforeEach(() => {
    model = new NftModel(new MetaModel());
    ctrl = new NftController(
      model,
      new OffChainStorage(new ClipItApiTestClient(), new IpfsTestClient()),
      new SubgraphTestClient(),
      new SnackbarController(new SnackbarModel())
    );
  });

  it("getCurrentSignerTokensMetadata sets metadata", async () => {
    await ctrl.getCurrentSignerTokensMetadata("addressX0X0");

    expect(model.meta.isLoading).toEqual(false);
    expect(model.meta.hasError).toEqual(false);
    expect(model.metadata.length).toBeGreaterThan(0);
    expect(model.metadata[0].tokenId).toEqual("1");
  });

  it("getTokenMetadata sets metadata", async () => {
    await ctrl.getTokenMetadata("1");

    expect(model.meta.isLoading).toEqual(false);
    expect(model.meta.hasError).toEqual(false);
    expect(model.metadata.length).toBeGreaterThan(0);
    expect(model.metadata[0].tokenId).toEqual("1");
  });

  it("getClips sets clips metadata", async () => {
    await ctrl.getClips();

    expect(model.meta.isLoading).toEqual(false);
    expect(model.meta.hasError).toEqual(false);
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
