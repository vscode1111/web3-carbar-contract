import { ethers, upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { TestUSDT } from "typechain-types/contracts/TestUSDT";
import { TestUSDT__factory } from "typechain-types/factories/contracts/TestUSDT__factory";
import { callWithTimer } from "utils/common";

const func: DeployFunction = async (): Promise<void> => {
  await callWithTimer(async () => {
    console.log("TestUSDT is deploying...");
    const [deployer] = await ethers.getSigners();
    const testUSDTFactory = <TestUSDT__factory>await ethers.getContractFactory("TestUSDT");
    const testUSDT = <TestUSDT>await testUSDTFactory.connect(deployer).deploy();
    await testUSDT.deployed();
  });
};

func.tags = ["TestUSDT"];

export default func;
