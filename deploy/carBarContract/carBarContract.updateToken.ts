import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { callWithTimerHre, waitForTx } from "utils/common";
import { getCarBarContext, getUsers } from "utils/context";

import { deployData } from "../deployData";
import { getAddressesFromHre } from "../utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { carBarAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} starts token updating...`);
    const { ownerCarBarContract } = await getCarBarContext(await getUsers(), carBarAddress);

    await waitForTx(
      ownerCarBarContract.updateToken(
        deployData.collectionId,
        deployData.tokenId,
        deployData.today,
      ),
      "updateToken",
    );

    console.log(`Token ${deployData.collectionId}/${deployData.tokenId} was updated`);
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:update-token`];

export default func;
