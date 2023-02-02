import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import { config as dotenvConfig } from "dotenv";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import { resolve } from "path";
import "tsconfig-paths/register";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({
  path: resolve(__dirname, dotenvConfigPath),
});

// Ensure that we have all the environment variables we need.
const providerUrl: string | undefined = process.env.PROVIDER_URL;
if (!providerUrl) {
  throw new Error("Please set your PROVIDER_URL in a .env file");
}

const adminPrivateKey = `0x${process.env.ADMIN_PRIVATE_KEY}`;
if (adminPrivateKey.length < 20) {
  throw new Error("Please set your ADMIN_PRIVATE_KEY in a .env file");
}
const userPrivateKey = `0x${process.env.USER_PRIVATE_KEY}`;
if (userPrivateKey.length < 20) {
  throw new Error("Please set your USER_PRIVATE_KEY in a .env file");
}

const chainConfig: NetworkUserConfig = {
  url: providerUrl,
  accounts: [adminPrivateKey, userPrivateKey],
};

const config: HardhatUserConfig = {
  // defaultNetwork: "mumbai",
  defaultNetwork: "polygon",
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      forking: {
        enabled: false,
        url: providerUrl,
        // blockNumber: 38747028, // <-- edit here
        blockNumber: 38759005, // <-- edit here
      },
      initialBaseFeePerGas: 0, // workaround from https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136 . Remove when that issue is closed.
      mining: {
        auto: true,
      },
      gasPrice: 0,
    },
    polygon: chainConfig,
    mumbai: chainConfig,
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.17",
    settings: {
      metadata: {
        bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  typechain: {
    // outDir: "types",
    target: "ethers-v5",
  },
};

export default config;
