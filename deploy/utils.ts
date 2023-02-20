import { HardhatRuntimeEnvironment } from "hardhat/types";
import { TestUSDT } from "typechain-types/contracts/TestUSDT";
import { DeployNetworks } from "types/common";
import { getAddresses } from "utils/context";

export async function getUSDTDecimalsFactor(testUSDT: TestUSDT) {
  const decimals = await testUSDT.decimals();
  return Math.pow(10, decimals);
}

export function getNetworkName(hre: HardhatRuntimeEnvironment): keyof DeployNetworks {
  const {
    network: { name },
  } = hre;

  return name as keyof DeployNetworks;
}

export function getAddressesFromHre(hre: HardhatRuntimeEnvironment) {
  return getAddresses(getNetworkName(hre));
}
