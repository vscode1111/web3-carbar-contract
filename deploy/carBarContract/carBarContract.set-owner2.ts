import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { callWithTimerHre, waitForTx } from "utils/common";
import { getCarBarContext, getUsers } from "utils/context";

import { getAddressesFromHre } from "../utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const users = await getUsers();
    const { owner } = users;
    const { carBarAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} giving super owner...`);
    const { superOwnerCarBarContract } = await getCarBarContext(users, carBarAddress);

    await waitForTx(superOwnerCarBarContract.setOwner(owner.address), "setOwner");

    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} new owner ${owner.address}`);
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:set-owner2`];

export default func;