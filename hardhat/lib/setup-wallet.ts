import { writeFileSync } from "fs";
import wallets from "../owners.json";
import { WALLETS_FILE_PATH } from "./constants";
import { HttpNetworkHDAccountsConfig, HardhatRuntimeEnvironment } from "hardhat/types";

export async function setupWallet(args: any, hre: HardhatRuntimeEnvironment) {
  let key;
  switch (hre.network.name) {
    case "ropsten":
      key = process.env["ROPSTEN_PRIVATE_KEY"];
      break;
    case "rinkeby":
      key = process.env["RINKEBY_PRIVATE_KEY"];
      break;
    case "hardhat":
    case "localhost":
      key = hre.ethers.Wallet.fromMnemonic(
        (hre.config.networks.localhost.accounts as HttpNetworkHDAccountsConfig).mnemonic
      );
  }

  if (!key) throw new Error(`Missing key for '${hre.network.name}' network in env`);

  const signer = new hre.ethers.Wallet(key, hre.ethers.provider);

  const numberOfWalletsToCreate: number = Number(args.count);

  const newWallets = [{ address: signer.address, mnemonic: signer.mnemonic, privateKey: signer.privateKey }];

  console.log(`Sending ${args.eth}ETH from: ${signer.address}`);

  for (let i = 0; i < numberOfWalletsToCreate; i++) {
    const newWallet = hre.ethers.Wallet.createRandom();
    const TO_ADDRESS = newWallet.address;

    console.log(`to: ${TO_ADDRESS}`);

    await signer.sendTransaction({
      to: TO_ADDRESS,
      value: hre.ethers.utils.parseEther(args.eth),
    });

    newWallets.push({ address: newWallet.address, mnemonic: newWallet.mnemonic, privateKey: newWallet.privateKey });
  }

  const provider = hre.network.name;
  const data = JSON.stringify(
    {
      ...wallets,
      [provider]: {
        wallets: newWallets,
      },
    },
    null,
    2
  );

  console.log(`Storing wallets for network: ${provider}`);
  console.log("Previous wallets.json", JSON.stringify(wallets));

  writeFileSync(WALLETS_FILE_PATH, data);

  console.log("New wallets.json", data);
}
