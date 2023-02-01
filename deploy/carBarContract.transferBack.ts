import { CONTRACTS } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { testValue } from "test/testData";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer } from "utils/common";

import { deployValue } from "./deployData";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const {
      ethers,
      network: { name },
    } = hre;
    const contractAddress = CONTRACTS.CAR_BAR[name as keyof DeployNetworks];

    console.log(`CarBarContract ${contractAddress} starts back transfering...`);

    const [admin, user] = await hre.ethers.getSigners();

    const carBarContractFactory = <CarBarContract__factory>(
      await ethers.getContractFactory("CarBarContract")
    );
    const userCarBarContract = <CarBarContract>(
      await carBarContractFactory.connect(user).attach(contractAddress)
    );

    let tx = await userCarBarContract.safeTransferFrom(
      user.address,
      admin.address,
      deployValue.collectionId,
      1,
      testValue.emptyData,
    );
    console.log(`Call safeTransferFrom...`);
    await tx.wait();
    console.log(`Token of ${deployValue.collectionId} collection was safeTransfered`);
  }, hre);
};

func.tags = ["CarBarContract:transfer-back"];

export default func;