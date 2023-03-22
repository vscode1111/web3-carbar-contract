import { callWithTimerHre, waitTx } from "common";
import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getCollections } from "seeds/seedData";
import { getAddressesFromHre, getCarBarContext, getUsers } from "utils";

const HOST_URL = "https://carbar.io/nft_json/cr1/";
const INIT_COLLECTION = true;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { carBarAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} is initiating...`);
    const { ownerCarBarContract } = await getCarBarContext(await getUsers(), carBarAddress);

    await waitTx(ownerCarBarContract.setName(`carbar.io v1`), "setName");
    await waitTx(ownerCarBarContract.setSymbol(`carbar`), "setSymbol");
    await waitTx(ownerCarBarContract.setURI(HOST_URL), "setURI");

    if (INIT_COLLECTION) {
      const collections = getCollections();

      for (const collection of collections) {
        await waitTx(
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
