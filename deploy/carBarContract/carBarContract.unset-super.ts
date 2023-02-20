import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { callWithTimer, waitForTx } from "utils/common";
import { getCarBarContext, getUsers } from "utils/context";

import { getAddressesFromHre } from "../utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const { carBarAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} returning super owner...`);
    const { superOwnerCarBarContract } = await getCarBarContext(await getUsers(), carBarAddress);

    await waitForTx(
      superOwnerCarBarContract.giveSuperOwnerPermissionToOwner(0),
      "giveSuperOwnerPermissionToOwner",
    );
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:unset-super`];

export default func;
