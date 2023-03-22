import { expect } from "chai";
import { BigNumber } from "ethers";
import { Context } from "mocha";
import { TOKEN_COUNT, getCollections, seedData } from "seeds/seedData";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { StringNumber } from "types";

import { Sold } from "./testData";

export function getCollectionName(name: StringNumber) {
  return `collection ${name}`;
}

export async function initCollections(carBarContract: CarBarContract, collectionCount = 3) {
  for (let i = 0; i < collectionCount; i++) {
    await carBarContract.createCollection(getCollectionName(i), i + 1, i + 2, i + 3);
  }
}

export async function initCollectionsReal(
  carBarContract: CarBarContract,
  tokenCount = TOKEN_COUNT,
  expiryDate = seedData.endTime2023,
) {
  const collections = getCollections(tokenCount, expiryDate);

  for (const collection of collections) {
    await carBarContract.createCollection(
      collection.name,
      collection.tokenCount,
      collection.price,
      collection.expiryDate,
    );
  }
}

export async function initCollectionsRealWithBuying(
  that: Context,
  tokenCount = 3,
  collectionId = 0,
  expiryDate = seedData.endTime2023,
) {
  await that.ownerTestUSDT.mint(that.user1.address, seedData.userInitialBalance0);
  await that.user1TestUSDT.approve(that.ownerCarBarContract.address, seedData.price01);
  await initCollectionsReal(that.ownerCarBarContract, tokenCount, expiryDate);
  await that.user1CarBarContract.buyToken(collectionId);
}

export function checkToken(token: CarBarContract.TokenItemStructOutput, i: number, owner: string) {
  expect(token.tokenId).eq(BigNumber.from(i));
  expect(token.owner).equal(owner);
  expect(token.expiryDate).equal(0);
  expect(token.sold).equal(Sold.None);
}
