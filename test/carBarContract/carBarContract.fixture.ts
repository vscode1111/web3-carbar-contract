import { ethers, upgrades } from "hardhat";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { TestUSDT } from "typechain-types/contracts/TestUSDT";
import { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";
import { TestUSDT__factory } from "typechain-types/factories/contracts/TestUSDT__factory";

import { ContextBase } from "../types";

export async function deployCarBarContractFixture(): Promise<ContextBase> {
  const [owner, user1, user2, shop, superOwner, owner2] = await ethers.getSigners();

  const testUSDTFactory = <TestUSDT__factory>await ethers.getContractFactory("TestUSDT");
  const ownerTestUSDT = <TestUSDT>await testUSDTFactory.connect(owner).deploy();
  await ownerTestUSDT.deployed();

  const user1TestUSDT = await ownerTestUSDT.connect(user1);
  const user2TestUSDT = await ownerTestUSDT.connect(user2);

  const carBarContractFactory = <CarBarContract__factory>(
    await ethers.getContractFactory("CarBarContract")
  );
  const ownerCarBarContract = <CarBarContract>await upgrades.deployProxy(
    carBarContractFactory,
    [ownerTestUSDT.address],
    {
      initializer: "initialize",
      kind: "uups",
    },
  );
  await ownerCarBarContract.deployed();

  const user1CarBarContract = await ownerCarBarContract.connect(user1);
  const user2CarBarContract = await ownerCarBarContract.connect(user2);
  const shopCarBarContract = await ownerCarBarContract.connect(shop);
  const superOwnerCarBarContract = await ownerCarBarContract.connect(superOwner);
  const owner2CarBarContract = await ownerCarBarContract.connect(owner2);

  return {
    ownerTestUSDT,
    user1TestUSDT,
    user2TestUSDT,
    ownerCarBarContract,
    user1CarBarContract,
    user2CarBarContract,
    shopCarBarContract,
    superOwnerCarBarContract,
    owner2CarBarContract,
  };
}
