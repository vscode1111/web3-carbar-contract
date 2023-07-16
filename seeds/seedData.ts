import { toUnixTime, toWei } from "common";
import dayjs from "dayjs";
import { jsonDictionary } from "deploy/deployData";
import { BigNumber } from "ethers";
import { DeployNetworks } from "types";

import { defaultNetwork } from "../hardhat.config";
import { ICollectionItem } from "./types";

export const PROD_PRICE = false;
export const PROD_DATA = false;

export const TOKEN_COUNT = 101;

const chainDecimals: Record<keyof DeployNetworks, number> = {
  opera: 6,
  polygon: 6,
  okc: 18,
};

export const TUSDT_DECIMALS = chainDecimals[defaultNetwork];

const PRICE_DIV = BigNumber.from(PROD_PRICE ? "1" : "1000");

export const seedData = {
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
  endTime2024: toUnixTime("2024-05-31 23:59:59"),
  emptyData: [],
  today: toUnixTime(),
  todayMinus1m: toUnixTime(dayjs().add(-1, "minute").toDate()),
  todayPlus1m: toUnixTime(dayjs().add(1, "minute").toDate()),
  todayPlus1h: toUnixTime(dayjs().add(1, "hour").toDate()),
  todayPlus3d1m: toUnixTime(dayjs().add(3, "day").add(1, "minute").toDate()),
  nullAddress: "0x0000000000000000000000000000000000000000",
  timeDelta: 300,
  attemps: 5,
  delayMs: 5000,
};

export function getCollections(
  tokenCount = TOKEN_COUNT,
  expiryDate = seedData.endTime2024,
): ICollectionItem[] {
  return [
    {
      name: jsonDictionary[0].name,
      tokenCount,
      price: seedData.price0,
      expiryDate,
    },
    {
      name: jsonDictionary[1].name,
      tokenCount,
      price: seedData.price1,
      expiryDate,
    },
    {
      name: jsonDictionary[2].name,
      tokenCount,
      price: seedData.price2,
      expiryDate,
    },
  ];
}
