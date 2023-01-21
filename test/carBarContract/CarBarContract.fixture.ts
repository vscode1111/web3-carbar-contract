import { ethers, upgrades } from "hardhat";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { TestUSDT } from "typechain-types/contracts/TestUSDT";
import { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";
import { TestUSDT__factory } from "typechain-types/factories/contracts/TestUSDT__factory";

import { ContextBase } from "./types";

export async function deployCarBarContractFixture(): Promise<ContextBase> {
  const [admin, user1, user2, shop] = await ethers.getSigners();

  const testUSDTFactory = <TestUSDT__factory>await ethers.getContractFactory("TestUSDT");
  const adminTestUSDT = <TestUSDT>await testUSDTFactory.connect(admin).deploy();
  await adminTestUSDT.deployed();

  const user1TestUSDT = await adminTestUSDT.connect(user1);
  const user2TestUSDT = await adminTestUSDT.connect(user2);

  const carBarContractFactory = <CarBarContract__factory>await ethers.getContractFactory("CarBarContract");
  const adminCarBarContract = <CarBarContract>await upgrades.deployProxy(
    carBarContractFactory,
    [adminTestUSDT.address],
    {
      initializer: "initialize",
      kind: "uups",
    },
  );
  await adminCarBarContract.deployed();

  const user1CarBarContract = await adminCarBarContract.connect(user1);
  const user2CarBarContract = await adminCarBarContract.connect(user2);
  const shopCarBarContract = await adminCarBarContract.connect(shop);

  return {
    adminTestUSDT,
    user1TestUSDT,
    user2TestUSDT,
    adminCarBarContract,
    user1CarBarContract,
    user2CarBarContract,
    shopCarBarContract,
  };
}
