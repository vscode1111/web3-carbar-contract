import { callWithTimerHre, waitTx } from "common";
import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getAddressesFromHre, getCarBarContext, getUsers } from "utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { carBarAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} giving super owner...`);
    const { superOwnerCarBarContract } = await getCarBarContext(await getUsers(), carBarAddress);

    await waitTx(
      superOwnerCarBarContract.giveSuperOwnerPermissionToOwner(0),
      "giveSuperOwnerPermissionToOwner",
    );
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:set-super`];

export default func;
