

export enum ErrorCodes {
  MISSING_PROVIDER = "MISSING_PROVIDER", // Please install MetaMask -> init the MetaMask onboarding flow,
  INVALID_PROVIDER = "INVALID_PROVIDER",
  RPC_DISCONNECT = "RPC_DISCONNECT",
  METAMASK_NOT_CONNECTED = "METAMASK_NOT_CONNECTED"
}

export default class ClipItError extends Error {
  code?: ErrorCodes;
  params: any;

  constructor(message: string, code?: ErrorCodes, params: any = {}) {
    super(message);

    this.code = code;
    this.params = params;
  }
}

