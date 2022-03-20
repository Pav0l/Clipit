import { signerAddress, chainId, signerBalance } from "../../../tests/__fixtures__/ethereum";

import { EthereumProvider, EthereumEvents, EthereumEventData, RequestArguments } from "./ethereum.types";

export class EthereumTestProvider implements EthereumProvider {
  isMetaMask = true;
  isProviderConnected = true;

  registeredListeners: Record<EthereumEvents, any[]> = {
    connect: [],
    accountsChanged: [],
    chainChanged: [],
    disconnect: [],
    message: [],
  };

  isConnected(): boolean {
    return this.isProviderConnected;
  }

  setIsConnected(val: boolean) {
    this.isProviderConnected = val;
  }

  setIsMM(val: boolean) {
    this.isMetaMask = val;
  }

  async request(args: RequestArguments): Promise<any> {
    switch (args.method) {
      case "eth_requestAccounts":
      case "eth_accounts":
        return [signerAddress];
      case "eth_chainid":
        return chainId;
      case "eth_getBalance":
        return signerBalance;
      default:
        throw new Error(`uninmplemented method: ${args.method}. please fix`);
    }
  }

  on(eventName: EthereumEvents, handler: (data: any) => void): void {
    this.registeredListeners[eventName].push(handler);
  }

  off(eventName: EthereumEvents, handler: (data: any) => void): void {
    // TBD
  }

  listeners(eventName: EthereumEvents) {
    return this.registeredListeners[eventName];
  }

  sendEventFromProvider(eventName: EthereumEvents, msg: EthereumEventData) {
    this.registeredListeners[eventName].forEach((listener) => listener(msg));
  }
}
