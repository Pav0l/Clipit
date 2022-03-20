import { EthereumTestProvider } from "../ethereum-test-provider";
import { IEthClient, EthereumClientCreator } from "../ethereum.client";

describe("ethereum.client", () => {
  let client: IEthClient;
  let provider: EthereumTestProvider;

  beforeEach(() => {
    provider = new EthereumTestProvider();
    client = EthereumClientCreator(provider);
  });

  it("does not register the same handler for an event twice", () => {
    function handler(data: any) {
      // do nothing
    }

    client.registerEventHandler("accountsChanged", handler);
    client.registerEventHandler("accountsChanged", handler);

    expect(provider.listeners("accountsChanged").length).toEqual(1);

    // but different handler is registered
    client.registerEventHandler("accountsChanged", () => null);
    expect(provider.listeners("accountsChanged").length).toEqual(2);
  });
});
