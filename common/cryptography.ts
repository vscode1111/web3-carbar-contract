import { ethers } from "ethers";
import { arrayify, keccak256, solidityKeccak256, toUtf8Bytes } from "ethers/lib/utils";

export function keccak256FromStr(data: string) {
  return keccak256(toUtf8Bytes(data));
}

interface Signer {
  signMessage(message: string | ethers.utils.Bytes): Promise<string>;
}

export async function signMessage(
  signer: Signer,
  types: readonly string[],
  values: readonly any[],
) {
  const hash = solidityKeccak256(types, values);
  const messageHashBin = arrayify(hash);
  return signer.signMessage(messageHashBin);
}
