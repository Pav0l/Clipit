import 'dotenv/config';
import '@typechain/hardhat'
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "hardhat-docgen";
import { task } from "hardhat/config";
import { HardhatUserConfig } from "hardhat/config";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("wallet:balance", "Prints Wallets balance in ETH")
  .addPositionalParam("wallet", "The wallet's address")
  .setAction(async (args, hre) => {
    const balance = await hre.ethers.provider.getBalance(args.wallet);
    console.log(hre.ethers.utils.formatEther(balance), "ETH");
  });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      allowUnlimitedContractSize: true,
      mining: { auto: true, interval: 0 },
      accounts: {
        initialIndex: 0,
        count: 5,
        path: "m/44'/60'/0'/0",
        mnemonic: 'test test test test test test test test test test test junk',
        accountsBalance: '100000000000000000000'
      }
    },
    hardhat: {
      allowUnlimitedContractSize: true
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env['INFURA_PROJECT_ID']}`,
      accounts: {
        mnemonic: process.env['ROPSTEN_MNEMONIC'],
        path: process.env['ROPSTEN_MNEMONIC_PATH']
      }
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env['INFURA_PROJECT_ID']}`,
      accounts: {
        mnemonic: process.env['RINKEBY_MNEMONIC'],
        path: process.env['RINKEBY_MNEMONIC_PATH']
      },
    }
  },
  etherscan: {
    apiKey: process.env['ETHERSCAN_API_KEY']
  },
  docgen: {
    path: './docs',
    clear: true,
    runOnCompile: false
  }
}

export default config;
