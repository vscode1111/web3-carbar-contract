import dayjs from "dayjs";
import { BigNumber } from "ethers";
import { toUnixTime, toWei } from "utils/common";

import { ICollectionItem } from "./types";

const PROD_DATA = false;

export const TOKEN_COUNT = PROD_DATA ? 300 : 60;

export const TUSDT_DECIMALS = 6;

const PRICE_DIV = BigNumber.from(PROD_DATA ? "1" : "1000");

export const testValue = {
  tokenCount: 5,
  collectionId0: 0,
  collectionId1: 1,
  collectionId2: 2,
  tokenId0: 0,
  tokenId1: 1,
  zero: toWei(0),
  price0: toWei(100, TUSDT_DECIMALS).div(PRICE_DIV),
  price1: toWei(160, TUSDT_DECIMALS).div(PRICE_DIV),
  price2: toWei(160, TUSDT_DECIMALS).div(PRICE_DIV),
  price01: toWei(100 + 160, TUSDT_DECIMALS).div(PRICE_DIV),
  userInitialBalance0: toWei(1000, TUSDT_DECIMALS).div(PRICE_DIV),
  userInitialBalance1: toWei(2000, TUSDT_DECIMALS).div(PRICE_DIV),
  userInitialBalance2: toWei(3000, TUSDT_DECIMALS).div(PRICE_DIV),
  userInitialBalance01: toWei(1000 + 2000, TUSDT_DECIMALS).div(PRICE_DIV),
  userInitialBalance012: toWei(1000 + 2000 + 3000, TUSDT_DECIMALS).div(PRICE_DIV),
  endTime2023: toUnixTime(PROD_DATA ? "2023-12-31 23:59:59" : "2023-04-30 23:59:59"),
  emptyData: [],
  newExpiryDate: dayjs().add(-1, "minute").toDate(),
};

export function getTestCollections(tokenCount = TOKEN_COUNT, expiryDate = testValue.endTime2023): ICollectionItem[] {
  return [
    {
      name: "Tesla Model 3 Stnd (1 Day)",
      tokenCount,
      price: testValue.price0,
      expiryDate,
    },
    {
      name: "Tesla Model 3 Prfm (1 Day)",
      tokenCount,
      price: testValue.price1,
      expiryDate,
    },
    {
      name: "Tesla Model Y (1 Day)",
      tokenCount,
      price: testValue.price2,
      expiryDate,
    },
  ];
}

export const errorMessage = {
  ownable: "Ownable: caller is not the owner",
  youMustBeOwnerOrApproved: "You must be owner of this token or approved",
  amountMustBe1: "Amount must be 1",
  priceMustBeGreaterZero: "Price must be greater than zero",
  userMustAllowToUseFunds: "User must allow to use of funds",
  userMustHaveFunds: "User must have funds",
  collectionMustHave1token: "The collection must have at least 1 available token",
  collectionExpirationMustBeGreater: "Collection expiration must be greater than the current time",
  tokenExpirationMustBeMore: "Token expiration must be more than a certain period from the current time",
  contractMustHaveSufficientFunds: "Contract must have sufficient funds",
  dataShouldBeCorrect: "Length of ids, amounts should be the correct",
  insufficientBalance: "ERC1155: insufficient balance for transfer",
  noFreeTokenId: "There is no free tokenId",
  couldntFindValidFreeId: "Couldn't find valid free id",
};

export enum Sold {
  None,
  Transfer,
  TokenSold,
}
