
// TODO clean up NftErrors, RpcErrors, ContractErrors between nft.errors, web3.errors and ethereum.types
export enum NftErrors {
  INSTALL_METAMASK = "Please install MetaMask extension and click the Connect button to view or create Clip NFTs",
  CONNECT_METAMASK = "Connect your MetaMask wallet to view or create Clip NFTs",
  DISCONNECTED = "It seems we were disconnected. Please check your internet connection",
  FAILED_TO_MINT = "Failed to generate the NFT",
  CONFITM_MINT = "Please confirm the mint transaction in MetaMask",
  MINT_REJECTED = "Mint transaction rejected",
  SOMETHING_WENT_WRONG = "Something went wrong",
  REQUEST_ALREADY_PENDING = "Request already pending. Please open your MetaMask wallet and confirm it",
  FAILED_TO_FETCH_SUBGRAPH_DATA = "There was an issue fetching your NFT data. The NFT was minted, however it may take some time to update the data. Please check your list of NFTs in couple of minutes"
}
