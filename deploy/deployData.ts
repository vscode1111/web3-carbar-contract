import { toUnixTime } from "utils/common";

export const deployValue = {
  collectionId: 0,
  tokenId: 0,
  today: toUnixTime(),
  // today: 0,
  nullAddress: "0x0000000000000000000000000000000000000000",

  // // remove
  // fromAddress: "0xECA894f3480364a6339692c5a9e7339109805a2C",
  // toAddress: "0x8E05d1F687d12eBBAA704a9c614d425bc13A3643",
  nftPostfix: "t0",
  withdrawAddress: "0x2Dd61D433319B0D0A446592376fC3613E70d686A",
};
