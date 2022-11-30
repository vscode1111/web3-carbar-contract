import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";

export type StringNumber = string | number;

export function getCollectionName(name: StringNumber) {
  return `collection ${name}`;
}

export function getCollectionUrl(name: StringNumber) {
  return `https://test${name}.com`;
}

export async function initCollections(carBarContract: CarBarContract, collectionCount = 3) {
  for (let i = 0; i < collectionCount; i++) {
    await carBarContract.createCollection(getCollectionName(i), getCollectionUrl(i), i + 1, i + 2, i + 3);
  }
}

export const PRICE0 = parseEther(160);
export const PRICE1 = parseEther(100);
export const PRICE2 = parseEther(160);
export const PRICE01 = PRICE0.add(PRICE1);

export const USER_INITIAL_BALANCE0 = parseEther(1000);
export const USER_INITIAL_BALANCE1 = parseEther(2000);
export const USER_INITIAL_BALANCE2 = parseEther(3000);
export const USER_INITIAL_BALANCE01 = USER_INITIAL_BALANCE0.add(USER_INITIAL_BALANCE1);
export const USER_INITIAL_BALANCE012 = USER_INITIAL_BALANCE0.add(USER_INITIAL_BALANCE1).add(USER_INITIAL_BALANCE2);

export const TOKEN_COUNT = 300;

export async function initCollectionsReal(
  carBarContract: CarBarContract,
  tokenCount = TOKEN_COUNT,
  expiryDate = 1703980800,
) {
  await carBarContract.createCollection(
    "Tesla Model 3 Stnd (1 Day)",
    "https://carbar.io/nft/Tesla_Model_3_Stnd.png",
    tokenCount,
    PRICE0,
    expiryDate,
  );
  await carBarContract.createCollection(
    "Tesla Model 3 Prfm (1 Day)",
    "https://carbar.io/nft/Tesla_Model_3_Prfm.png",
    tokenCount,
    PRICE1,
    expiryDate,
  );
  await carBarContract.createCollection(
    "Tesla Model 3 Prfm (1 Day)",
    "https://carbar.io/nft/Tesla_Model_3_Prfm.png",
    tokenCount,
    PRICE2,
    expiryDate,
  );
}

export function checkToken(token: CarBarContract.TokenItemStructOutput, i: number, owner: string) {
  expect(token.tokenId).to.eq(BigNumber.from(i));
  expect(token.owner).to.equal(owner);
  expect(token.expiryDate).to.equal(0);
  expect(token.sold).to.equal(false);
}

export function parseEther(value: StringNumber) {
  return ethers.utils.parseEther(String(value));
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
