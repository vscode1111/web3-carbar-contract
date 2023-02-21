import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import { config as dotenvConfig } from "dotenv";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import { resolve } from "path";
import "tsconfig-paths/register";
import { DeployNetworks } from "types/common";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({
  path: resolve(__dirname, dotenvConfigPath),
});

function getEnv(key: string) {
  const envKey = process.env[key];
  if (!envKey) {
    throw new Error(`Please set your ${key} in a .env file`);
  }
  return envKey;
}

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
      opera: process.env.OPERASCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    currency: "USD",
    // enabled: process.env.REPORT_GAS ? true : false,
    enabled: false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      forking: {
        enabled: false,
        url: getChainConfig(defaultNetwork).url ?? "",
        // blockNumber: 38747028, // <-- edit here
        blockNumber: 38759005, // <-- edit here
      },
      initialBaseFeePerGas: 0, // workaround from https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136 . Remove when that issue is closed.
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
