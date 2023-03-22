import { callWithTimerHre, waitTx } from "common";
import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { seedData } from "seeds/seedData";
import { getAddressesFromHre, getCarBarContext, getUsers } from "utils";

import { deployData } from "../deployData";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { carBarAddress } = await getAddressesFromHre(hre);
    console.log(
      `${CAR_BAR_CONTRACT_NAME} ${carBarAddress} starts transfering from user1 to user2...`,
    );
    const users = await getUsers();
    const { user1, user2 } = users;
    const { user1CarBarContract } = await getCarBarContext(users, carBarAddress);

    await waitTx(
      user1CarBarContract.safeTransferFrom(
        user1.address,
        user2.address,
        seedData.collectionId0,
        1,
        seedData.emptyData,
      ),
      "safeTransferFrom",
    );

    console.log(`Token of ${deployData.collectionId} collection was safeTransfered`);
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:transfer12`];

export default func;
