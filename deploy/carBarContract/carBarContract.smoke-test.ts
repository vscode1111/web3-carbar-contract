import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { smokeTest } from "test/carBarContract/carBarContract.behavior.smoke-test";
import { callWithTimerHre } from "utils/common";
import { getContext } from "utils/context";

import { getAddressesFromHre } from "../utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { carBarAddress, usdtAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} run smoke test...`);

    const context = await getContext(carBarAddress, usdtAddress);

    await smokeTest(context);
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:smoke-test`];

export default func;
