import { expect } from "chai";
import { BigNumber } from "ethers";
import { Context } from "mocha";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { StringNumber } from "types/common";

import { Sold, TOKEN_COUNT, getTestCollections, testValue } from "./data";

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
  expiryDate = testValue.endTime2023,
) {
  const collections = getTestCollections(tokenCount, expiryDate);

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
  expiryDate = testValue.endTime2023,
) {
  await that.adminTestUSDT.mint(that.user1.address, testValue.userInitialBalance0);
  await that.user1TestUSDT.approve(that.adminCarBarContract.address, testValue.price01);
  await initCollectionsReal(that.adminCarBarContract, tokenCount, expiryDate);
  await that.user1CarBarContract.buyToken(collectionId);
}

export function checkToken(token: CarBarContract.TokenItemStructOutput, i: number, owner: string) {
  expect(token.tokenId).to.eq(BigNumber.from(i));
  expect(token.owner).to.equal(owner);
  expect(token.expiryDate).to.equal(0);
  expect(token.sold).to.equal(Sold.None);
}

export async function expectThrowsAsync(method: () => Promise<any>, errorMessage: string) {
  let error: any = null;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).to.be.an("Error");
  if (errorMessage) {
    expect(error?.message).to.equal(errorMessage);
  }
}

export function vmEsceptionText(text: string) {
  return `VM Exception while processing transaction: reverted with reason string '${text}'`;
}
