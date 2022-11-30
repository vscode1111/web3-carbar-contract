import { TOKENS } from "constants/addresses";
import { ethers, upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import type { CarBarContract } from "typechain-types/contracts/CarBarContract";
import type { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";
import { NetworkInitialData } from "types/common";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  console.log("CarBarContract proxy is deploying...");
  // const initialData = (hre.network.config as any).initialDate as NetworkInitialData;
  const carBarContractFactory = <CarBarContract__factory>await ethers.getContractFactory("CarBarContract");
  const carBarContract = <CarBarContract>await upgrades.deployProxy(
    carBarContractFactory,
    // [initialData.usdtTokenAddress],
    [TOKENS.USDT.mumbai],
    {
      initializer: "initialize",
      kind: "uups",
    },
  );
  await carBarContract.deployed();
  console.log(`CarBarContract deployed to: ${carBarContract.address}`);
};

func.tags = ["CarBarContract:proxy"];

export default func;
