import { callWithTimerHre, waitTx } from "common";
import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { seedData } from "seeds/seedData";
import { getAddressesFromHre, getCarBarContext, getUsers } from "utils";

import { deployData } from "../deployData";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { carBarAddress, superOwnerAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} starts transfering...`);
    const users = await getUsers();
    const { user1 } = users;
    const { ownerCarBarContract } = await getCarBarContext(users, carBarAddress);

    await waitTx(
      ownerCarBarContract.safeTransferFrom(
        superOwnerAddress,
        user1.address,
        deployData.collectionId,
        1,
        seedData.emptyData,
      ),
      "safeTransferFrom",
    );

    console.log(`Token of ${deployData.collectionId} collection was safeTransfered`);
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:transfer`];

export default func;
