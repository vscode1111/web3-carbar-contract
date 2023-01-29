import { CONTRACTS, TOKENS } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { testValue } from "test/testData";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { TestUSDT } from "typechain-types/contracts/TestUSDT";
import { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";
import { TestUSDT__factory } from "typechain-types/factories/contracts/TestUSDT__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer } from "utils/common";

import { deployValue } from "./deployData";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const {
      ethers,
      network: { name },
    } = hre;
    const carBarAddress = CONTRACTS.CAR_BAR[name as keyof DeployNetworks];
    const usdtAddress = TOKENS.USDT[name as keyof DeployNetworks];

    console.log(`CarBarContract [${carBarAddress}] starts buying...`);

    const [, user] = await hre.ethers.getSigners();

    const testUSDTFactory = <TestUSDT__factory>await ethers.getContractFactory("TestUSDT");
    const testUSDT = <TestUSDT>await testUSDTFactory.connect(user).attach(usdtAddress);

    let tx = await testUSDT.approve(carBarAddress, testValue.price0);

    console.log(`Call approve...`);
    await tx.wait();
    console.log(`USDT ${testValue.price0.toNumber()} was approved`);

    const carBarContractFactory = <CarBarContract__factory>await ethers.getContractFactory("CarBarContract");
    const carBarContract = <CarBarContract>await carBarContractFactory.connect(user).attach(carBarAddress);

    tx = await carBarContract.buyToken(deployValue.collectionId);
    console.log(`Call buyToken...`);
    await tx.wait();
    console.log(`Token ${deployValue.collectionId} was bought`);
  }, hre);
};

func.tags = ["CarBarContract:buy"];

export default func;
