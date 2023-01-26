import { toUnixTime } from "utils/common";

export const deployValue = {
  collectionId: 1,
  tokenId: 9,
  today: toUnixTime(),
  // today: 0,
  nullAddress: "0x0000000000000000000000000000000000000000",
  userAddress: "0xeca894f3480364a6339692c5a9e7339109805a2c",

  // add
  fromAddress: "0x90aa0e69acf6ebed3a124625dd14a19ae8aa81b1",
  toAddress: "0xeca894f3480364a6339692c5a9e7339109805a2c",

  // // remove
  // fromAddress: "0xECA894f3480364a6339692c5a9e7339109805a2C",
  // toAddress: "0x8E05d1F687d12eBBAA704a9c614d425bc13A3643",
  nftPostfix: "t0",
};
