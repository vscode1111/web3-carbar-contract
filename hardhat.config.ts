import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import { config as dotenvConfig } from "dotenv";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import { resolve } from "path";
import "tsconfig-paths/register";
import { DeployNetworks } from "types";

import { getEnv } from "./common/config";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({
  path: resolve(__dirname, dotenvConfigPath),
});

function getChainConfig(chain: keyof DeployNetworks): NetworkUserConfig & { url?: string } {
  return {
    url: getEnv(`${chain.toUpperCase()}_PROVIDER_URL`),
    accounts: [
      `0x${getEnv("OWNER_PRIVATE_KEY")}`,
      `0x${getEnv("USER1_PRIVATE_KEY")}`,
      `0x${getEnv("USER2_PRIVATE_KEY")}`,
      `0x${getEnv("SHOP_PRIVATE_KEY")}`,
      `0x${getEnv("SUPER_OWNER_PRIVATE_KEY")}`,
      `0x${getEnv("OWNER2_PRIVATE_KEY")}`,
    ],
  };
}

const defaultNetwork: keyof DeployNetworks = "polygon";

const config: HardhatUserConfig = {
  defaultNetwork,
  etherscan: {
    apiKey: {
      polygon: getEnv("POLYGONSCAN_API_KEY"),
      opera: getEnv("OPERASCAN_API_KEY"),
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      forking: {
        enabled: false,
        url: getChainConfig(defaultNetwork).url ?? "",
        blockNumber: 39656567, // <-- edit here
      },
      initialBaseFeePerGas: 0,
      mining: {
        auto: true,
      },
      gasPrice: 0,
    },
    opera: getChainConfig("opera"),
    polygon: getChainConfig("polygon"),
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
