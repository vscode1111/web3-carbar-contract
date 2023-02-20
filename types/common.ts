import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export interface DeployNetworks {
  opera: string;
  polygon: string;
}

export interface Users {
  owner: SignerWithAddress;
  user1: SignerWithAddress;
  user2: SignerWithAddress;
  shop: SignerWithAddress;
  superOwner: SignerWithAddress;
  owner2: SignerWithAddress;
}

export interface Addresses {
  carBarAddress: string;
  superOwnerAddress: string;
  usdtAddress: string;
}

export type StringNumber = string | number;
