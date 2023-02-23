import { BigNumber } from "ethers";

export interface ICollectionItem {
  name: string;
  tokenCount: number;
  price: BigNumber;
  expiryDate: number;
}
