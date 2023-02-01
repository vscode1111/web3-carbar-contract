import { CONTRACTS, TOKENS } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { TestUSDT } from "typechain-types/contracts/TestUSDT";
import { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";
import { TestUSDT__factory } from "typechain-types/factories/contracts/TestUSDT__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer } from "utils/common";

import { deployValue } from "./deployData";
import { getUSDTDecimalsFactor } from "./utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const {
      ethers,
      network: { name },
    } = hre;
    const contractAddress = CONTRACTS.CAR_BAR[name as keyof DeployNetworks];

    console.log(`CarBarContract ${contractAddress} starts token withdrawing...`);

    const [admin] = await hre.ethers.getSigners();

    const testUsdtFactory = <TestUSDT__factory>await ethers.getContractFactory("TestUSDT");

    const usdtTokenAddress = TOKENS.USDT[name as keyof DeployNetworks];

    const testUSDT = <TestUSDT>await testUsdtFactory.connect(admin).attach(usdtTokenAddress);

    const factor = await getUSDTDecimalsFactor(testUSDT);

    const amount = await testUSDT.balanceOf(contractAddress);

    const carBarContractFactory = <CarBarContract__factory>(
      await ethers.getContractFactory("CarBarContract")
    );
    const adminCarBarContract = <CarBarContract>(
      await carBarContractFactory.connect(admin).attach(contractAddress)
    );

    let tx = await adminCarBarContract.withdraw(deployValue.withdrawAddress, amount);
    console.log(`Call withdraw...`);
    await tx.wait();
    console.log(
      `${amount.toNumber() / factor} USDT was withdrawed to ${deployValue.withdrawAddress}`,
    );
  }, hre);
};

func.tags = ["CarBarContract:withdraw"];

export default func;
