import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getTestCollections } from "test/testData";
import { callWithTimerHre, waitForTx } from "utils/common";
import { getCarBarContext, getUsers } from "utils/context";

import { deployValue } from "../deployData";
import { getAddressesFromHre } from "../utils";

const HOST_URL = "https://carbar.online/nft_json";
const INIT_COLLECTION = true;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { carBarAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} is initiating...`);
    const { ownerCarBarContract } = await getCarBarContext(await getUsers(), carBarAddress);

    await waitForTx(ownerCarBarContract.setName(`carbar.io v1`), "setName");
    await waitForTx(ownerCarBarContract.setSymbol(`carbar`), "setSymbol");
    await waitForTx(ownerCarBarContract.setURI(`${HOST_URL}/${deployValue.nftPostfix}/`), "setURI");

    if (INIT_COLLECTION) {
      const collections = getTestCollections();

      for (const collection of collections) {
        await waitForTx(
          ownerCarBarContract.createCollection(
            collection.name,
            collection.tokenCount,
            collection.price,
            collection.expiryDate,
          ),
          `createCollection "${collection.name}"`,
        );
      }
    }
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:init`];

export default func;
