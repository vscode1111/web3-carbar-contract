import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber } from "ethers";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { TestUSDT } from "typechain-types/contracts/TestUSDT";

type Fixture<T> = () => Promise<T>;

export interface ContextBase {
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
    owner: SignerWithAddress;
    user1: SignerWithAddress;
    user2: SignerWithAddress;
    shop: SignerWithAddress;
    superOwner: SignerWithAddress;
    owner2: SignerWithAddress;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
  }
}

export interface ICollectionItem {
  name: string;
  tokenCount: number;
  price: BigNumber;
  expiryDate: number;
}
