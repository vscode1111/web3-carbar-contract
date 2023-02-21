import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { callWithTimerHre, verifyContract } from "utils/common";
import { getCarBarContext, getUsers } from "utils/context";

import { getAddressesFromHre } from "../utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { carBarAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} is upgrading...`);
    const { carBarContractFactory } = await getCarBarContext(await getUsers(), carBarAddress);
    await upgrades.upgradeProxy(carBarAddress, carBarContractFactory);
    console.log(`${CAR_BAR_CONTRACT_NAME} upgraded to ${carBarAddress}`);
    await verifyContract(carBarAddress, hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} upgraded and verified to ${carBarAddress}`);
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:upgrade`];

export default func;
