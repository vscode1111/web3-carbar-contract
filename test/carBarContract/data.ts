import { toUnixTime, toWei } from "utils/common";

import { ICollectionItem } from "./types";

export const TOKEN_COUNT = 300;

export const PRICE0 = toWei(160);
export const PRICE1 = toWei(100);
export const PRICE2 = toWei(160);
export const PRICE01 = PRICE0.add(PRICE1);

export const USER_INITIAL_BALANCE0 = toWei(1000);
export const USER_INITIAL_BALANCE1 = toWei(2000);
export const USER_INITIAL_BALANCE2 = toWei(3000);
export const USER_INITIAL_BALANCE01 = USER_INITIAL_BALANCE0.add(USER_INITIAL_BALANCE1);
export const USER_INITIAL_BALANCE012 = USER_INITIAL_BALANCE0.add(USER_INITIAL_BALANCE1).add(USER_INITIAL_BALANCE2);

export const END_TIME_2023 = toUnixTime("2022-12-31 23:59:59");

export function getTestCollections(tokenCount = TOKEN_COUNT, expiryDate = END_TIME_2023): ICollectionItem[] {
  return [
    {
      name: "Tesla Model 3 Stnd (1 Day)",
      url: "https://carbar.io/nft/Tesla_Model_3_Stnd.png",
      tokenCount,
      price: PRICE0,
      expiryDate,
    },
    {
      name: "Tesla Model 3 Prfm (1 Day)",
      url: "https://carbar.io/nft/Tesla_Model_3_Prfm.png",
      tokenCount,
      price: PRICE1,
      expiryDate,
    },
    {
      name: "Tesla Model Y (1 Day)",
      url: "Tesla Model Y (1 Day)",
      tokenCount,
      price: PRICE2,
      expiryDate,
    },
  ];
}
