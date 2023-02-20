import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { callWithTimer, waitForTx } from "utils/common";
import { getCarBarContext, getUsers } from "utils/context";

import { deployValue } from "../deployData";
import { getAddressesFromHre } from "../utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const { carBarAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} starts token updating...`);
    const { ownerCarBarContract } = await getCarBarContext(await getUsers(), carBarAddress);

    await waitForTx(
      ownerCarBarContract.updateToken(
        deployValue.collectionId,
        deployValue.tokenId,
        deployValue.today,
      ),
      "updateToken",
    );

    console.log(`Token ${deployValue.collectionId}/${deployValue.tokenId} was updated`);
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:update-token`];

export default func;
