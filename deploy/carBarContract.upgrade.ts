import { ethers, upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import type { CarBarContract } from "typechain-types/contracts/CarBarContract";
import type { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";

const proxyAddress = "0x75a82E06C0744D606aE709c6B3De4F9bD1226bd3";

const func: DeployFunction = async (): Promise<void> => {
  console.log("TestUSDT is upgrading...");
  const carBarContractFactory = <CarBarContract__factory>await ethers.getContractFactory("CarBarContract");
  const carBarContract = <CarBarContract>await upgrades.upgradeProxy(proxyAddress, carBarContractFactory);
  console.log(`CarBarContract was upgrated in: ${carBarContract.address}`);
};

func.tags = ["CarBarContract:upgrade"];

export default func;
