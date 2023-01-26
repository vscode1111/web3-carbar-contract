import { TOKENS } from "constants/addresses";
import { upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer } from "utils/common";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    console.log("CarBarContract proxy is deploying...");
    const {
      ethers,
      network: { name },
    } = hre;
    const usdtTokenAddress = TOKENS.USDT[name as keyof DeployNetworks];
    console.log(`USDT address is ${usdtTokenAddress}`);
    const carBarContractFactory = <CarBarContract__factory>await ethers.getContractFactory("CarBarContract");
    const carBarContract = <CarBarContract>await upgrades.deployProxy(carBarContractFactory, [usdtTokenAddress], {
      initializer: "initialize",
      kind: "uups",
    });
    await carBarContract.deployed();
    console.log(`CarBarContract deployed to ${carBarContract.address}`);
  }, hre);
};

func.tags = ["CarBarContract:proxy"];

export default func;
