import { BigNumber } from "ethers";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { TestUSDT } from "typechain-types/contracts/TestUSDT";
import { Users } from "types";

type Fixture<T> = () => Promise<T>;

export interface ContextBase extends Users {
  ownerTestUSDT: TestUSDT;
  user1TestUSDT: TestUSDT;
  user2TestUSDT: TestUSDT;
  ownerCarBarContract: CarBarContract;
  user1CarBarContract: CarBarContract;
  user2CarBarContract: CarBarContract;
  shopCarBarContract: CarBarContract;
  superOwnerCarBarContract: CarBarContract;
  owner2CarBarContract: CarBarContract;
}

declare module "mocha" {
  export interface Context extends ContextBase {
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
  }
}

export interface ICollectionItem {
  name: string;
  tokenCount: number;
  price: BigNumber;
  expiryDate: number;
}

export interface IMetadata {
  name: string;
  image: string;
  banner?: string;
  description: string;
}
