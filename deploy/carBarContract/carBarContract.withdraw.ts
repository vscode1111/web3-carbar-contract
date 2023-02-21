import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { callWithTimerHre, waitForTx } from "utils/common";
import { getContext } from "utils/context";

import { getAddressesFromHre, getUSDTDecimalsFactor } from "../utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { carBarAddress, usdtAddress } = await getAddressesFromHre(hre);

    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} starts token withdrawing...`);

    const { user1, ownerTestUSDT, ownerCarBarContract } = await getContext(
      carBarAddress,
      usdtAddress,
    );

    const factor = await getUSDTDecimalsFactor(ownerTestUSDT);
    const amount = await ownerTestUSDT.balanceOf(carBarAddress);

    await waitForTx(ownerCarBarContract.withdraw(user1.address, amount), "withdraw");

    console.log(`${amount.toNumber() / factor} USDT was withdrawed to ${user1.address}`);
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:withdraw`];

export default func;
