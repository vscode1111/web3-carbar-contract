import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { callWithTimerHre, verifyContract } from "utils/common";
import { getCarBarContext, getUsers } from "utils/context";

import { getAddressesFromHre } from "../utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    console.log(`${CAR_BAR_CONTRACT_NAME} proxy is deploying...`);
    const { superOwnerAddress, usdtAddress } = await getAddressesFromHre(hre);
    console.log(`USDT address is ${usdtAddress}`);
    const users = await getUsers();
    const { ownerCarBarContract } = await getCarBarContext(users, {
      superOwnerAddress,
      usdtAddress,
    });
    await ownerCarBarContract.deployed();
    console.log(`${CAR_BAR_CONTRACT_NAME} deployed to ${ownerCarBarContract.address}`);
    await verifyContract(ownerCarBarContract.address, hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} deployed and verified to ${ownerCarBarContract.address}`);
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:proxy`];

export default func;
