import { BigNumber, BigNumberish, ethers } from "ethers";
import { formatUnits } from "ethers/lib/utils";

import { StringNumber } from "./types";

export function toWei(value: StringNumber, unitName?: BigNumberish): BigNumber {
  return ethers.utils.parseUnits(String(value), unitName);
}

export function toNumber(value: BigNumber, factor = 1): number {
  return Number(ethers.utils.formatEther(value)) * factor;
}

export function toNumberDecimals(value: BigNumber, decimals = 18): number {
  return Number(formatUnits(value, decimals));
}
