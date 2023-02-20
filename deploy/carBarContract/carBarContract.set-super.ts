import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { callWithTimer, waitForTx } from "utils/common";
import { getCarBarContext, getUsers } from "utils/context";

import { getAddressesFromHre } from "../utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const { carBarAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} giving super owner...`);
    const { superOwnerCarBarContract } = await getCarBarContext(await getUsers(), carBarAddress);

    await waitForTx(
      superOwnerCarBarContract.giveSuperOwnerPermissionToOwner(1),
      "giveSuperOwnerPermissionToOwner",
    );
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:set-super`];

export default func;
