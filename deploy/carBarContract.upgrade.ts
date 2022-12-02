import { CONTRACTS } from "constants/addresses";
import { upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import type { CarBarContract } from "typechain-types/contracts/CarBarContract";
import type { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";
import { DeployNetworks } from "types/common";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  const {
    ethers,
    network: { name },
  } = hre;
  const contractAddress = CONTRACTS.CAR_BAR[name as keyof DeployNetworks];

  console.log(`CarBarContract [${contractAddress}] is upgrading...`);

  const carBarContractFactory = <CarBarContract__factory>await ethers.getContractFactory("CarBarContract");
  const carBarContract = <CarBarContract>await upgrades.upgradeProxy(contractAddress, carBarContractFactory);

  console.log(`CarBarContract was upgrated in: ${carBarContract.address}`);
};

func.tags = ["CarBarContract:upgrade"];

export default func;
