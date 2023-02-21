import { expect } from "chai";
import { BigNumber } from "ethers";
import { Context } from "mocha";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { StringNumber } from "types/common";

import { Sold, TOKEN_COUNT, getTestCollections, testValue } from "./testData";

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
  await that.ownerTestUSDT.mint(that.user1.address, testValue.userInitialBalance0);
  await that.user1TestUSDT.approve(that.ownerCarBarContract.address, testValue.price01);
  await initCollectionsReal(that.ownerCarBarContract, tokenCount, expiryDate);
  await that.user1CarBarContract.buyToken(collectionId);
}

export function checkToken(token: CarBarContract.TokenItemStructOutput, i: number, owner: string) {
  expect(token.tokenId).eq(BigNumber.from(i));
  expect(token.owner).equal(owner);
  expect(token.expiryDate).equal(0);
  expect(token.sold).equal(Sold.None);
}

export async function expectThrowsAsync(method: () => Promise<any>, errorMessage: string) {
  let error: any = null;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).an("Error");
  if (errorMessage) {
    expect(error?.message).equal(errorMessage);
  }
}

export function vmEsceptionText(text: string) {
  return `VM Exception while processing transaction: reverted with reason string '${text}'`;
}

export function revertedEsceptionText(text: string) {
  return `execution reverted: ${text}`;
}

export function errorHandler(error: object, message: string) {
  if ("reason" in error) {
    expect(error.reason).eq(revertedEsceptionText(message));
  } else if ("message" in error) {
    expect(error.message).eq(vmEsceptionText(message));
  }
}

export function getNow() {
  return Math.round(new Date().getTime() / 1000);
}
