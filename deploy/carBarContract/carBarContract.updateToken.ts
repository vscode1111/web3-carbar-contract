import { callWithTimerHre, waitTx } from "common";
import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getAddressesFromHre, getCarBarContext, getUsers } from "utils";

import { deployData } from "../deployData";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { carBarAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} starts token updating...`);
    const { ownerCarBarContract } = await getCarBarContext(await getUsers(), carBarAddress);

    await waitTx(
      ownerCarBarContract.updateToken(deployData.collectionId, deployData.tokenId, deployData.now),
      "updateToken",
    );

    console.log(`Token ${deployData.collectionId}/${deployData.tokenId} was updated`);
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:update-token`];

export default func;
