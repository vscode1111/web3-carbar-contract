import { callWithTimerHre, verifyContract } from "common";
import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getAddressesFromHre, getCarBarContext, getUsers } from "utils";

import { verifyRequired } from "../deployData";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { carBarAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} is upgrading...`);
    const { carBarContractFactory } = await getCarBarContext(await getUsers(), carBarAddress);
    await upgrades.upgradeProxy(carBarAddress, carBarContractFactory);
    console.log(`${CAR_BAR_CONTRACT_NAME} upgraded to ${carBarAddress}`);
    if (verifyRequired) {
      await verifyContract(carBarAddress, hre);
      console.log(`${CAR_BAR_CONTRACT_NAME} upgraded and verified to ${carBarAddress}`);
    }
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:upgrade`];

export default func;
