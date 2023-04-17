import { callWithTimerHre, toNumberDecimals, waitTx } from "common";
import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getAddressesFromHre, getContext } from "utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { carBarAddress, usdtAddress } = await getAddressesFromHre(hre);

    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} starts token withdrawing...`);

    const { user1, ownerTestUSDT, ownerCarBarContract } = await getContext(
      carBarAddress,
      usdtAddress,
    );

    const amount = await ownerTestUSDT.balanceOf(carBarAddress);

    await waitTx(ownerCarBarContract.withdraw(user1.address, amount), "withdraw");

    console.log(
      `${toNumberDecimals(amount, await ownerTestUSDT.decimals())} USDT was withdrawed to ${
        user1.address
      }`,
    );
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:withdraw`];

export default func;
