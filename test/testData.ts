import dayjs from "dayjs";
import { JSON_DICTIONARY } from "deploy/deployData";
import { BigNumber } from "ethers";

import { toUnixTime, toWei } from "../utils/common";
import { ICollectionItem } from "./types";

const PROD_DATA = true;

export const TOKEN_COUNT = PROD_DATA ? 101 : 60;

export const TUSDT_DECIMALS = 6;

const PRICE_DIV = BigNumber.from(PROD_DATA ? "1" : "1000");

export const testValue = {
  collectionCount: 3,
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
  endTime2023: toUnixTime(PROD_DATA ? "2023-05-31 23:59:59" : "2023-04-30 23:59:59"),
  emptyData: [],
  today: toUnixTime(),
  todayMinus1m: toUnixTime(dayjs().add(-1, "minute").toDate()),
  todayPlus1m: toUnixTime(dayjs().add(1, "minute").toDate()),
  todayPlus1h: toUnixTime(dayjs().add(1, "hour").toDate()),
  todayPlus3d1m: toUnixTime(dayjs().add(3, "day").add(1, "minute").toDate()),
  nullAddress: "0x0000000000000000000000000000000000000000",
  timeDelta: 30,
  attemps: 5,
  delayMs: 5000,
};

export function getTestCollections(
  tokenCount = TOKEN_COUNT,
  expiryDate = testValue.endTime2023,
): ICollectionItem[] {
  return [
    {
      name: JSON_DICTIONARY[0].name,
      tokenCount,
      price: testValue.price0,
      expiryDate,
    },
    {
      name: JSON_DICTIONARY[1].name,
      tokenCount,
      price: testValue.price1,
      expiryDate,
    },
    {
      name: JSON_DICTIONARY[2].name,
      tokenCount,
      price: testValue.price2,
      expiryDate,
    },
  ];
}

export const errorMessage = {
  onlySuperOwnerOrOwner: "Only superOwner or owner has right to call this function",
  onlySuperOwnerOrPermittedOwner:
    "Only superOwner or owner who has permission can call this function",
  youMustBeOwnerOrApproved: "You must be owner of this token or approved",
  priceMustBeGreaterZero: "Price must be greater than zero",
  userMustAllowToUseFunds: "User must allow to use of funds",
  userMustHaveFunds: "User must have funds",
  collectionMustHave1token: "The collection must have at least 1 available token",
  collectionExpirationMustBeGreater: "Collection expiration must be greater than the current time",
  tokenExpirationMustBeMore:
    "Token expiration must be more than a certain period from the current time",
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

export enum Roles {
  SUPER_OWNER_ROLE = "0x8b1505cddb35f62ac075d7162e97e437accb1359b84bdfe7c73611681f2dc87c",
  OWNER_ROLE = "0xb19546dff01e856fb3f010c267a7b1c60363cf8a4664e21cc89c26224620214e",
}
