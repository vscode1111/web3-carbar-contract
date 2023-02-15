import { CONTRACTS } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
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

    console.log(`CarBarContract ${contractAddress} starts token updating...`);

    const [owner] = await hre.ethers.getSigners();

    const carBarContractFactory = <CarBarContract__factory>(
      await ethers.getContractFactory("CarBarContract")
    );
    const ownerCarBarContract = <CarBarContract>(
      await carBarContractFactory.connect(owner).attach(contractAddress)
    );

    let tx = await ownerCarBarContract.updateToken(
      deployValue.collectionId,
      deployValue.tokenId,
      deployValue.today,
    );
    console.log(`Call updateToken...`);
    await tx.wait();
    console.log(`Token ${deployValue.collectionId}/${deployValue.tokenId} was updated`);
  }, hre);
};

func.tags = ["CarBarContract:update-token"];

export default func;
