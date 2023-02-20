import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { smokeTest } from "test/carBarContract/carBarContract.behavior.smoke-test";
import { ContextBase } from "test/types";
import { callWithTimer } from "utils/common";
import { getCarBarContext, getUsdtContext, getUsers } from "utils/context";

import { getAddressesFromHre } from "../utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const { carBarAddress, usdtAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} run smoke test...`);

    const users = await getUsers();
    const usdtContext = await getUsdtContext(users, usdtAddress);
    const carBarContext = await getCarBarContext(users, carBarAddress);

    const context: ContextBase = {
      ...users,
      ...usdtContext,
      ...carBarContext,
    };

    await smokeTest(context, false);
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:smoke-test`];

export default func;
