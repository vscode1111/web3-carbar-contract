import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { StringNumber } from "types/common";

export function toWei(value: StringNumber): BigNumber {
  return ethers.utils.parseEther(String(value));
}

export function toUnixTime(value: string | Date = new Date()): number {
  return Math.floor(new Date(value).getTime() / 1000);
}
