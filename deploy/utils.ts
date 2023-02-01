import { TestUSDT } from "typechain-types/contracts/TestUSDT";

export async function getUSDTDecimalsFactor(testUSDT: TestUSDT) {
  const decimals = await testUSDT.decimals();
  return Math.pow(10, decimals);
}
