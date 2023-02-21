import { BigNumber, BigNumberish, ContractReceipt, ContractTransaction } from "ethers";
import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import _ from "lodash";
import { StringNumber } from "types/common";

import { DiffArray } from "./DiffArray";

export const DECIMAL_FACTOR = 1e18;
const FRACTION_DIGITS = 3;

export function toWei(value: StringNumber, unitName?: BigNumberish): BigNumber {
  return ethers.utils.parseUnits(String(value), unitName);
}

export function toNumber(value: BigNumber, factor = 1): number {
  return Number(ethers.utils.formatEther(value)) * factor;
}

export function toUnixTime(value: string | Date = new Date()): number {
  return Math.floor(new Date(value).getTime() / 1000);
}

export function numberToByteArray(value: number, bytesNumber = 4): number[] {
  var byteArray = new Array(bytesNumber).fill(0);

  for (var index = byteArray.length - 1; index >= 0; index--) {
    var byte = value & 0xff;
    byteArray[index] = byte;
    value = (value - byte) / 256;
  }

  return byteArray;
}

export function byteArrayToNumber(byteArray: number[]): number {
  var value = 0;
  for (var i = byteArray.length - 1; i >= 0; i--) {
    value = value * 256 + byteArray[i];
  }

  return value;
}

export async function getBalances() {
  const users = await ethers.getSigners();
  return Promise.all(users.map(async (user) => toNumber(await user.getBalance())));
}

export function printBalances(balances?: number[]) {
  return `${balances?.map((balance) => balance.toFixed(FRACTION_DIGITS)).join(", ")}`;
}
export function printSum(balances?: number[]) {
  return _.sum(balances).toFixed(FRACTION_DIGITS);
}

export async function callWithTimer(fn: () => Promise<void>) {
  const startTime = new Date();
  await fn();
  const finishTime = new Date();
  return (finishTime.getTime() - startTime.getTime()) / 1000;
}

export async function callWithTimerHre(
  fn: () => Promise<void>,
  hre?: HardhatRuntimeEnvironment,
  finishMessageFn?: (diff: string) => string,
) {
  const startTime = new Date();
  let diffArray;
  let extText = "";

  if (hre) {
    const {
      network: { name },
    } = hre;

    const balances = await getBalances();
    diffArray = new DiffArray(balances);
    extText = `, network: ${name}, balances: ${printBalances(balances)} = ${_.sum(balances).toFixed(
      FRACTION_DIGITS,
    )}`;
  }

  const startMessage = `->Function was started at ${startTime.toLocaleTimeString()}${extText}`;
  console.log(startMessage);
  await fn();
  const finishTime = new Date();
  const diff = ((finishTime.getTime() - startTime.getTime()) / 1000).toFixed(1);

  if (hre) {
    const balances = await getBalances();
    const costDiff = diffArray?.diff(balances);
    extText = `, balances: ${printBalances(balances)} = ${printSum(
      balances,
    )}, costs: ${printBalances(costDiff)} = ${printSum(costDiff)}`;
  }

  const finishMessage = finishMessageFn
    ? finishMessageFn(diff)
    : `<-Function was finished at ${finishTime.toLocaleTimeString()} in ${diff} sec${extText}`;
  console.log(finishMessage);
}

export async function delay(ms: number): Promise<number> {
  return new Promise((resolve: any) => setTimeout(resolve, ms));
}

export async function verifyContract(
  address: string,
  hre: HardhatRuntimeEnvironment,
  args?: unknown,
): Promise<void> {
  let count = 0;
  const maxTries = 5;

  while (count < maxTries) {
    try {
      console.log(`=>Attempt #${count + 1} to verifying contract at ${address}...`);
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: args,
      });
      return;
    } catch (error) {
      console.log(error);
      const errorObj = error as object;
      if (
        "message" in errorObj &&
        typeof errorObj.message === "string" &&
        errorObj.message.includes("Already Verified")
      ) {
        break;
      }

      count += 1;
      await delay(5000);
    }
  }

  if (count === maxTries) {
    console.log("Failed to verify contract address %s", address);
    throw new Error("Verification failed");
  }
}

export async function attempt(fn: () => Promise<any>, attempts = 3, delayMs = 1000): Promise<any> {
  try {
    return await fn();
  } catch (e) {
    if (attempts > 0) {
      console.log(e);
      await delay(delayMs);
      console.log(`${attempts - 1} attempts left`);
      return await attempt(fn, attempts - 1, delayMs);
    } else {
      throw e;
    }
  }
}

export async function waitForTx(
  promise: Promise<ContractTransaction>,
  functionName?: string,
  attempts = 3,
  delayMs = 1000,
): Promise<ContractReceipt> {
  return attempt(
    async () => {
      let receipt!: ContractReceipt;
      const time = await callWithTimer(async function () {
        if (functionName) {
          console.log(`TX: ${functionName} ...`);
        }
        const tx = await promise;
        if (functionName) {
          console.log(`TX: ${functionName} hash: ${tx.hash} ...`);
        }
        receipt = await tx.wait();
      });

      if (functionName && receipt) {
        const gas = receipt.gasUsed;
        const price = toNumber(gas.mul(receipt.effectiveGasPrice));
        console.log(
          `TX: ${functionName} time: ${time.toFixed(1)} sec, gas: ${gas}, fee: ${price.toFixed(
            FRACTION_DIGITS,
          )}`,
        );
      }
      return receipt;
    },
    attempts,
    delayMs,
  );
}
