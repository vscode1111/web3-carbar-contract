import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { callWithTimer, waitForTx } from "utils/common";
import { getCarBarContext, getUsdtContext, getUsers } from "utils/context";

import { deployValue } from "../deployData";
import { getAddressesFromHre, getUSDTDecimalsFactor } from "../utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const { carBarAddress, usdtAddress } = await getAddressesFromHre(hre);

    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} starts token withdrawing...`);
    const users = await getUsers();
    const { ownerTestUSDT } = await getUsdtContext(users, usdtAddress);
    const { ownerCarBarContract } = await getCarBarContext(users, carBarAddress);

    const factor = await getUSDTDecimalsFactor(ownerTestUSDT);
    const amount = await ownerTestUSDT.balanceOf(carBarAddress);

    await waitForTx(ownerCarBarContract.withdraw(deployValue.withdrawAddress, amount), "withdraw");

    console.log(
      `${amount.toNumber() / factor} USDT was withdrawed to ${deployValue.withdrawAddress}`,
    );
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:withdraw`];

export default func;
