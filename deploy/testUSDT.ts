import { USDT_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { callWithTimerHre, verifyContract } from "utils/common";
import { getUsdtContext, getUsers } from "utils/context";

const func: DeployFunction = async (hre): Promise<void> => {
  await callWithTimerHre(async () => {
    console.log("TestUSDT is deploying...");
    const { ownerTestUSDT } = await getUsdtContext(await getUsers());
    await ownerTestUSDT.deployed();
    console.log(`${USDT_CONTRACT_NAME} deployed to ${ownerTestUSDT.address}`);
    await verifyContract(ownerTestUSDT.address, hre);
    console.log(`${USDT_CONTRACT_NAME} deployed and verified to ${ownerTestUSDT.address}`);
  }, hre);
};

func.tags = [USDT_CONTRACT_NAME];

export default func;
