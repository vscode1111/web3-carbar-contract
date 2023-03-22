import { getNetworkName } from "common";
import {
  ACCOUNTS,
  CAR_BAR_CONTRACT_NAME,
  CONTRACTS,
  TOKENS,
  USDT_CONTRACT_NAME,
} from "constants/addresses";
import { ethers, upgrades } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ContextBase } from "test/types";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { TestUSDT } from "typechain-types/contracts/TestUSDT";
import { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";
import { TestUSDT__factory } from "typechain-types/factories/contracts/TestUSDT__factory";
import { Addresses, DeployNetworks, Users } from "types";

export function getAddresses(network: keyof DeployNetworks): Addresses {
  const carBarAddress = CONTRACTS.CAR_BAR[network];
  const superOwnerAddress = ACCOUNTS.SUPER_OWNER[network];
  const usdtAddress = TOKENS.USDT[network];
  return {
    carBarAddress,
    superOwnerAddress,
    usdtAddress,
  };
}

export function getAddressesFromHre(hre: HardhatRuntimeEnvironment) {
  return getAddresses(getNetworkName(hre));
}

export async function getUsers(): Promise<Users> {
  const [owner, user1, user2, shop, superOwner, owner2] = await ethers.getSigners();
  return {
    owner,
    user1,
    user2,
    shop,
    superOwner,
    owner2,
  };
}

export async function getCarBarContext(
  users: Users,
  createObj: { superOwnerAddress: string; usdtAddress: string } | string,
) {
  const { owner, user1, user2, shop, superOwner, owner2 } = users;

  const carBarContractFactory = <CarBarContract__factory>(
    await ethers.getContractFactory(CAR_BAR_CONTRACT_NAME)
  );

  let ownerCarBarContract: CarBarContract;

  if (typeof createObj === "string") {
    const contractAddress = createObj as string;
    ownerCarBarContract = <CarBarContract>(
      await carBarContractFactory.connect(owner).attach(contractAddress)
    );
  } else {
    ownerCarBarContract = <CarBarContract>await upgrades.deployProxy(
      carBarContractFactory,
      [createObj!.superOwnerAddress, createObj!.usdtAddress],
      {
        initializer: "initialize",
        kind: "uups",
      },
    );
  }

  const user1CarBarContract = ownerCarBarContract.connect(user1);
  const user2CarBarContract = ownerCarBarContract.connect(user2);
  const shopCarBarContract = ownerCarBarContract.connect(shop);
  const superOwnerCarBarContract = ownerCarBarContract.connect(superOwner);
  const owner2CarBarContract = ownerCarBarContract.connect(owner2);

  return {
    carBarContractFactory,
    ownerCarBarContract,
    user1CarBarContract,
    user2CarBarContract,
    shopCarBarContract,
    superOwnerCarBarContract,
    owner2CarBarContract,
  };
}

export async function getUsdtContext(users: Users, usdtAddress?: string) {
  const { owner, user1, user2, shop, superOwner, owner2 } = users;

  const testUSDTFactory = <TestUSDT__factory>await ethers.getContractFactory(USDT_CONTRACT_NAME);

  let ownerTestUSDT: TestUSDT;

  if (usdtAddress) {
    ownerTestUSDT = <TestUSDT>testUSDTFactory.connect(owner).attach(usdtAddress);
  } else {
    ownerTestUSDT = <TestUSDT>await testUSDTFactory.connect(owner).deploy();
  }

  const user1TestUSDT = ownerTestUSDT.connect(user1);
  const user2TestUSDT = ownerTestUSDT.connect(user2);
  const shopTestUSDT = ownerTestUSDT.connect(shop);
  const superOwnerTestUSDT = ownerTestUSDT.connect(superOwner);
  const owner2TestUSDT = ownerTestUSDT.connect(owner2);

  return {
    ownerTestUSDT,
    user1TestUSDT,
    user2TestUSDT,
    shopTestUSDT,
    superOwnerTestUSDT,
    owner2TestUSDT,
  };
}

export async function getContext(carBarAddress: string, usdtAddress: string): Promise<ContextBase> {
  const users = await getUsers();
  const usdtContext = await getUsdtContext(users, usdtAddress);
  const carBarContext = await getCarBarContext(users, carBarAddress);

  return {
    ...users,
    ...usdtContext,
    ...carBarContext,
  };
}
