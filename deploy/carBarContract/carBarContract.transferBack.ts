import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { seedData } from "seeds/seedData";
import { callWithTimerHre, waitForTx } from "utils/common";
import { getCarBarContext, getUsers } from "utils/context";

import { deployData } from "../deployData";
import { getAddressesFromHre } from "../utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { carBarAddress, superOwnerAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} starts back transfering...`);
    const users = await getUsers();
    const { user1 } = users;
    const { user1CarBarContract } = await getCarBarContext(await getUsers(), carBarAddress);

    await waitForTx(
      user1CarBarContract.safeTransferFrom(
        user1.address,
        superOwnerAddress,
        deployData.collectionId,
        1,
        seedData.emptyData,
      ),
      "safeTransferFrom",
    );
    console.log(`Token of ${deployData.collectionId} collection was safeTransfered`);
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:transfer-back`];

export default func;
